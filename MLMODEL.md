# Coco Care — Leaf Disease ML Model

This document explains how the coconut **leaf disease classification** model works in Coco Care: the model itself, how images flow from the UI to Azure and back, how raw Azure tags are mapped to user‑facing diseases, and how to configure and troubleshoot it.

> Only the **Coconut Leaves & Leaflets** category uses the ML model. All other categories (Stem/Trunk, Bud/Crown, Fruit, Whole Tree) use a symptom‑based questionnaire, not the image model.

---

## 1. Overview

| Aspect | Detail |
|--------|--------|
| Provider | **Azure Custom Vision** (image classification project) |
| Task | Multi‑class leaf disease classification from a single photo |
| Input | One coconut‑leaf image (JPEG/PNG), compressed client‑side |
| Output | Probability score per disease class + top prediction |
| Where it runs | Azure cloud; the backend calls the prediction endpoint |
| Model classes (Azure tags) | 8 raw tags → mapped to **7** user‑facing labels |

The frontend never talks to Azure directly. The React app sends the image to the Coco Care backend, and the backend calls Azure with the secret prediction key. This keeps the key server‑side.

---

## 2. End‑to‑end flow

```
┌────────────┐   compressed    ┌──────────────┐   binary image   ┌───────────────────┐
│  Browser   │  data URL       │  Backend API │  + Prediction-Key │  Azure Custom     │
│ (React UI) │ ──────────────▶ │  /api/diagnosis│ ───────────────▶ │  Vision endpoint  │
└────────────┘                 └──────────────┘                   └───────────────────┘
      ▲                              │   raw predictions (tags + probabilities)  │
      │        DiagnosisResult       │◀──────────────────────────────────────────┘
      └──────────────────────────────┘
                 (labels mapped, advice attached, report saved)
```

### Step by step

1. **Capture / upload (frontend).** On the Leaf Diagnosis page the user uploads or photographs a leaf. The file is resized and compressed in the browser before upload.
   - Code: `front_end/src/utils/compressImage.ts` — downscales to max **1280px** on the longest side and encodes JPEG at **quality 0.82**, returning a `data:` URL. This prevents the "request entity too large" error and speeds uploads.

2. **Submit (frontend → backend).** The compressed data URL is POSTed to the backend:
   - Endpoint: `POST /api/diagnosis`
   - Auth: requires a logged‑in **farmer** (JWT).
   - Body: `{ farmId, category: 'leaves', imageUrl: <dataURL>, symptoms: {} }`
   - The backend accepts up to **15 MB** JSON bodies (`express.json({ limit: '15mb' })`).

3. **Classify (backend → Azure).** For `category === 'leaves'`, the service calls `classifyImage()`:
   - Code: `backend/src/services/azureVision.service.ts`
   - The data URL is decoded to a binary buffer. If it were a remote URL instead, it would be fetched first.
   - The configured prediction URL (which ends in `/classify/iterations/<name>/url`) is rewritten to the **`/image`** endpoint so we can upload the image bytes directly.
   - Request: `POST <predictionUrl>/image` with headers `Prediction-Key` and `Content-Type: application/octet-stream`, body = image bytes.

4. **Azure responds** with a list of predictions, one per trained tag:
   ```json
   {
     "predictions": [
       { "tagName": "CCI_Leaflets", "probability": 0.386 },
       { "tagName": "Gray_Leaf_Spot", "probability": 0.275 },
       { "tagName": "Leaf_Rot", "probability": 0.149 },
       { "tagName": "Healthy Leaves", "probability": 0.086 },
       { "tagName": "WCLWD_Flaccidity", "probability": 0.066 },
       { "tagName": "CCI_Caterpiller", "probability": 0.028 },
       { "tagName": "WCLWD_Yellowing", "probability": 0.005 },
       { "tagName": "WCLWD_DryingofLeaflets", "probability": 0.004 }
     ]
   }
   ```

5. **Map & aggregate (backend).** Raw Azure tags are normalized and mapped to the 7 user‑facing labels, and probabilities are aggregated (see §4).
   - Code: `backend/src/constants/leafDiseaseLabels.ts`

6. **Persist & respond.** The backend uploads the image (S3 or data‑URL fallback), saves a diagnosis **report**, attaches **advice** for the top disease, and returns a `DiagnosisResult` including the full `predictions` array and optional `detectedEvidence` for CCI.
   - Code: `backend/src/modules/diagnosis/diagnosis.service.ts`

7. **Display (frontend).** The UI shows the ranked probability bars, the top prediction, and a rich disease information card.

---

## 3. Model classes

The Azure project is trained with **8 tags**. Some are stage/evidence variants that collapse into a single user‑facing disease, giving **7** displayed classes.

| Azure tag (raw) | User‑facing label |
|-----------------|-------------------|
| `Healthy Leaves` | Healthy Coconut Leaf |
| `Gray_Leaf_Spot` | Gray Leaf Spot |
| `Leaf_Rot` | Leaf Rot |
| `WCLWD_Yellowing` | Weligama Coconut Leaf Wilt – Early Stage (Yellowing) |
| `WCLWD_Flaccidity` | Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity) |
| `WCLWD_DryingofLeaflets` | Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets) |
| `CCI_Caterpiller` | Coconut Caterpillar Infestation (CCI) |
| `CCI_Leaflets` | Coconut Caterpillar Infestation (CCI) |

Notes:
- **WCLWD** is one disease but is presented as three separate stage pages, because the model can distinguish early/intermediate/advanced symptoms.
- **CCI** has two evidence tags (`CCI_Caterpiller` = the insect visible, `CCI_Leaflets` = feeding damage). Both map to one disease, but the app surfaces which evidence was strongest (see §5).

---

## 4. Tag mapping & aggregation

All logic lives in `backend/src/constants/leafDiseaseLabels.ts`.

### Normalization
`normalizeTag()` lowercases, replaces underscores with spaces, and collapses whitespace, so `WCLWD_Yellowing` → `wclwd yellowing`. This makes mapping resilient to Azure's underscore naming and minor spelling differences.

### Mapping
`mapTagToDisplayLabel()` looks up a normalized tag in an alias table (`TAG_ALIASES`) and falls back to matching a display name directly. Unknown tags return `null` and are ignored.

### Aggregation
`buildLeafPredictions()` produces exactly one entry per user‑facing disease:
- For diseases with multiple contributing tags (CCI, and conceptually WCLWD stages), it takes the **maximum** probability among the mapped tags — `scores.set(label, Math.max(existing, probability))`.
- It then returns all 7 labels in a fixed order, filling `0` for any disease the model didn't score.

This guarantees the UI always renders the same 7 rows, and the CCI bar reflects the stronger of its two evidence tags.

### Top prediction & fallback
In `azureVision.service.ts`:
- The top prediction is the highest‑probability mapped label.
- If nothing maps above 0 (all unknown tags), it **falls back** to the single highest raw Azure tag so the user still gets a best‑effort result.

---

## 5. CCI "detected evidence"

Because CCI has two evidence tags, `getCciDetectedEvidence()` compares them:
- If `CCI_Caterpiller` ≥ `CCI_Leaflets` → **"Detected Evidence: Caterpillar Present"**
- Otherwise → **"Detected Evidence: Leaf Feeding Damage"**

This string is attached to the result (`detectedEvidence`) only when CCI is the top prediction, and is shown in the prediction panel and detail card. It gives a more precise, scientifically accurate diagnosis without treating the two tags as separate pests.

---

## 6. Result shape

`classifyImage()` returns a `VisionResult`, which the diagnosis service expands into a `DiagnosisResult`:

```ts
interface DiagnosisResult {
  id: string
  category?: 'leaves' | 'stem' | 'bud' | 'fruit' | 'whole-tree'
  imageResult: string          // top disease label (for leaves)
  symptomResult: string        // 'ML classification only' for leaves
  finalResult: string          // same as imageResult for leaves
  confidence: number           // top probability (0–1)
  status: 'verified' | 'pending'
  advice: string               // guidance for the top disease
  predictions?: { label: string; probability: number }[]  // all 7, ranked in UI
  detectedEvidence?: string    // CCI only
}
```

### Status
`resolveStatus()` marks a report **verified** when `confidence >= FUSION_CONFIDENCE_THRESHOLD` (default **0.75**), otherwise **pending** (awaiting officer review). This threshold is shared with the symptom flow.

### Advice
`getLeafAdvice()` returns a short, disease‑specific action string from `LEAF_DISEASE_ADVICE`. Richer content (symptoms, causes, prevention, stage info) lives in the frontend at `front_end/src/app/diagnosis/leafDiseaseInfo.ts` and is rendered by `LeafDiseaseDetailCard.tsx`.

---

## 7. Configuration

Set these in `backend/.env` (see `backend/.env.example`):

```bash
# Azure Custom Vision — leaf disease ML model
AZURE_CV_ENDPOINT=https://<resource>.cognitiveservices.azure.com/
AZURE_CV_KEY=<your prediction key>
AZURE_CV_PREDICTION_URL=https://<resource>-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/<projectId>/classify/iterations/<iterationName>/url
```

- `AZURE_CV_KEY` and `AZURE_CV_PREDICTION_URL` are **required** for classification. If either is missing, `classifyImage()` throws a clear configuration error.
- The prediction URL is copied from the Azure Custom Vision portal ("Prediction URL" → "If you have an image URL"). The backend automatically switches it to the image‑upload (`/image`) variant at runtime.
- Loaded via `backend/src/config/env.ts` as `env.azureCvKey` and `env.azureCvPredictionUrl`.

---

## 8. Key files

| File | Responsibility |
|------|----------------|
| `front_end/src/utils/compressImage.ts` | Client‑side resize/compress before upload |
| `front_end/src/app/pages/LeafDiseaseDiagnosis.tsx` | Leaf upload + classify UI |
| `front_end/src/app/diagnosis/LeafPredictionPanel.tsx` | Ranked probability bars + top prediction |
| `front_end/src/app/diagnosis/LeafDiseaseDetailCard.tsx` | Rich disease information card |
| `front_end/src/app/diagnosis/leafDiseaseInfo.ts` | Descriptions, symptoms, causes, prevention |
| `backend/src/modules/diagnosis/diagnosis.routes.ts` | `POST /api/diagnosis` route (farmer‑only) |
| `backend/src/modules/diagnosis/diagnosis.service.ts` | Orchestrates classify → advice → save → respond |
| `backend/src/services/azureVision.service.ts` | Azure Custom Vision API integration |
| `backend/src/constants/leafDiseaseLabels.ts` | Tag normalization, mapping, aggregation, advice |
| `backend/src/config/env.ts` | Environment/config loading |
| `backend/tests/leafDiseaseLabels.test.ts` | Unit tests for mapping/aggregation |

---

## 9. Testing

`backend/tests/leafDiseaseLabels.test.ts` verifies the mapping and aggregation against a real Azure response shape:
- Underscore tags map to the correct user‑facing labels.
- `buildLeafPredictions()` returns all 7 labels with correct probabilities.
- Both CCI tags merge using the **max** probability.

Run:

```bash
cd backend
npm test -- leafDiseaseLabels.test.ts
```

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Azure Custom Vision is not configured" | Missing `AZURE_CV_KEY` / `AZURE_CV_PREDICTION_URL` | Set both in `backend/.env`, restart backend |
| All predictions show **0%** | Azure tag names don't match the alias table | Confirm tag names in the Azure portal, extend `TAG_ALIASES` in `leafDiseaseLabels.ts` |
| "request entity too large" | Image too big | Ensure `compressImageForUpload` runs; backend limit is 15 MB |
| `classification failed (401/403)` | Wrong/expired prediction key | Regenerate the key in Azure, update `.env` |
| `classification failed (404)` | Wrong project/iteration in the URL | Copy the exact Prediction URL from the portal for the published iteration |
| Predictions look off | Wrong published iteration | Publish/point the URL at the intended iteration |

### Debugging
In non‑production, the backend logs the raw Azure predictions (tag + percentage) to the console for each classification — useful for confirming what the model returned before mapping.

---

## 11. Retraining / updating the model

1. Add/label images in the Azure Custom Vision project.
2. Train a new iteration.
3. **Publish** the iteration and copy its Prediction URL.
4. Update `AZURE_CV_PREDICTION_URL` in `backend/.env` and restart.
5. If tag names changed, update `TAG_ALIASES` / `LEAF_DISPLAY_DISEASES` in `leafDiseaseLabels.ts` and adjust `leafDiseaseInfo.ts` content and tests accordingly.
