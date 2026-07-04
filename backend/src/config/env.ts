import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  awsRegion: process.env.AWS_REGION ?? 'us-east-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? '',
  azureCvEndpoint: process.env.AZURE_CV_ENDPOINT ?? '',
  azureCvKey: process.env.AZURE_CV_KEY ?? '',
  bertModelName:
    process.env.BERT_MODEL_NAME ?? 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
  bertRequired: process.env.BERT_REQUIRED !== 'false',
  ragTopK: Number(process.env.RAG_TOP_K) || 8,
  ragMinScore: Number(process.env.RAG_MIN_SCORE) || 0.5,
  knowledgeDataDir: process.env.KNOWLEDGE_DATA_DIR ?? './data/cri-manuals',
  fusionConfidenceThreshold: Number(process.env.FUSION_CONFIDENCE_THRESHOLD) || 0.75,
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY ?? '',
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  /** When false, skip Groq even if key is set. Default: enabled when key present. */
  groqEnabled: process.env.GROQ_ENABLED !== 'false',
}
