import { Send, Mic, FileText, Sparkles } from "lucide-react";
import { useState } from "react";

const suggestedQuestions = [
  "How to treat bud rot disease?",
  "Best fertilizer for coconut trees?",
  "How to increase coconut yield?",
  "How to prevent caterpillar attacks?",
  "What is the ideal watering schedule?",
  "Signs of stem bleeding disease?",
];

const initialMessages = [
  {
    role: "assistant",
    content: "Hello! I'm your AI farming assistant. I can help you with coconut cultivation, disease management, fertilizer recommendations, and general farming questions. How can I help you today?",
    time: "Just now",
  },
];

export function AIChatbot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      time: "Just now",
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        content: getAIResponse(input),
        time: "Just now",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (question: string) => {
    if (question.toLowerCase().includes("bud rot")) {
      return "Bud rot disease is a serious condition in coconut palms. Here's how to treat it:\n\n1. Remove and destroy infected tissues immediately\n2. Apply Bordeaux mixture (1%) to the affected area\n3. Improve drainage around the tree\n4. Apply recommended fungicides like Copper oxychloride\n5. Ensure proper sanitation of tools\n\nPrevention is key - maintain good field hygiene and avoid water stagnation in the crown.";
    }
    if (question.toLowerCase().includes("fertilizer")) {
      return "For optimal coconut growth, I recommend:\n\n1. NPK fertilizer (15:15:15) at 2-3 kg per tree annually\n2. Apply in 2-3 split doses during monsoon\n3. Organic manure: 25-50 kg per tree per year\n4. Micronutrients: Boron, Zinc, and Magnesium\n\nApplication method:\n- Dig a circular trench 1.5-2m from the trunk\n- Apply fertilizer and cover with soil\n- Water thoroughly after application";
    }
    return "That's a great question! Based on agricultural best practices and our knowledge base, here's what I recommend: Regular monitoring of your plantation, maintaining proper irrigation, using organic fertilizers, and early disease detection are key to successful coconut farming. Would you like more specific information about any aspect?";
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 h-full flex flex-col">
        <div className="border-b border-green-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl text-[#1a2e1a]">AI Farming Assistant</h1>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online & Ready to Help
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">PDF Knowledge Base</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-[#2d5f2e] text-white"
                    : "bg-gray-100 text-gray-900"
                } rounded-2xl px-4 py-3`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-green-100" : "text-gray-500"
                  }`}
                >
                  {message.time}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-4">
              <h3 className="text-sm text-gray-900 mb-3">Suggested Questions:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className="text-left px-3 py-2 bg-white rounded-lg text-sm text-gray-700 hover:bg-green-50 hover:text-[#2d5f2e] transition-colors border border-green-100"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-green-100 p-4">
          <div className="flex items-center gap-3">
            <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about coconut farming..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e] bg-gray-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
