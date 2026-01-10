# AI Agents Guide

This document explains how the AI-powered customer service agent works in the Support Marketing Agent, including architecture, implementation details, and training strategies.

---

## Overview

The AI customer service agent autonomously handles common customer inquiries such as order status, shipping information, returns, and product questions. The system uses a **Retrieval-Augmented Generation (RAG)** approach combined with confidence scoring to determine when to escalate to human agents.

---

## Architecture

### Components

The AI agent system consists of four main components working together to provide intelligent customer support.

**Knowledge Base** stores all the information the AI needs to answer questions. This includes product documentation, shipping policies, return procedures, FAQs, and troubleshooting guides. Each article is tagged with categories and keywords for efficient retrieval.

**Vector Search Engine** converts both the knowledge base articles and customer questions into high-dimensional vectors (embeddings). When a customer asks a question, the system finds the most semantically similar articles, even if the wording is completely different. This enables the AI to understand intent rather than just matching keywords.

**Language Model** generates natural, conversational responses based on the retrieved context. The system uses a large language model (LLM) that has been fine-tuned on e-commerce customer service conversations. The model takes the customer's question and relevant knowledge base articles as input, then generates a helpful response.

**Confidence Scorer** evaluates how certain the AI is about its response. If confidence is low, the conversation is escalated to a human agent. This prevents the AI from providing incorrect or unhelpful information.

### Data Flow

When a customer sends a message, the following sequence occurs:

1. **Message Ingestion**: Customer message arrives via email, chat, or social media
2. **Intent Classification**: System determines the type of inquiry (order status, shipping, returns, etc.)
3. **Context Retrieval**: Vector search finds the 3-5 most relevant knowledge base articles
4. **Response Generation**: LLM generates a response using the retrieved context
5. **Confidence Scoring**: System evaluates response quality and certainty
6. **Decision**: If confidence > 0.7, send response; otherwise escalate to human
7. **Logging**: Conversation is saved for training and quality assurance

---

## Implementation Details

### Knowledge Base Schema

The knowledge base is stored in the `aiKnowledge` table:

```typescript
aiKnowledge {
  id: int (PK)
  organizationId: int
  title: string
  content: text
  category: enum (shipping, returns, products, billing, technical)
  tags: json (string[])
  isPublished: boolean
  embedding: json (number[]) // 1536-dimensional vector
  createdAt: timestamp
  updatedAt: timestamp
}
```

Each article is converted into an embedding using OpenAI's `text-embedding-3-small` model, which produces a 1536-dimensional vector representing the semantic meaning of the content.

### Vector Search

Vector search is implemented using cosine similarity:

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function findRelevantArticles(query: string, limit: number = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const articles = await db.select().from(aiKnowledge);
  
  const scored = articles.map(article => ({
    article,
    score: cosineSimilarity(queryEmbedding, article.embedding),
  }));
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.article);
}
```

For production deployments with large knowledge bases (1000+ articles), we recommend using a dedicated vector database like Pinecone, Weaviate, or Qdrant for faster search.

### Response Generation

The LLM receives a carefully crafted prompt that includes:

```typescript
const systemPrompt = `You are a helpful customer service agent for ${organizationName}.
Your goal is to provide accurate, friendly, and concise answers to customer questions.

Use the following knowledge base articles to answer the question:

${relevantArticles.map(a => `Title: ${a.title}\n${a.content}`).join('\n\n')}

Guidelines:
- Be friendly and empathetic
- Provide specific information from the knowledge base
- If you're not certain, say so and offer to escalate
- Keep responses under 200 words
- Use bullet points for multiple steps
- Include relevant links when available`;

const response = await invokeLLM({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: customerQuestion },
  ],
});
```

### Confidence Scoring

Confidence is calculated using multiple signals:

```typescript
function calculateConfidence(
  response: string,
  retrievedArticles: Article[],
  topScore: number
): number {
  let confidence = 0;
  
  // Signal 1: Vector search score (0-40 points)
  confidence += topScore * 40;
  
  // Signal 2: Response length (0-20 points)
  // Longer responses tend to be more confident
  const wordCount = response.split(' ').length;
  confidence += Math.min(wordCount / 100, 1) * 20;
  
  // Signal 3: Presence of uncertainty phrases (0-20 points)
  const uncertainPhrases = ['not sure', 'might', 'possibly', 'perhaps'];
  const hasUncertainty = uncertainPhrases.some(phrase => 
    response.toLowerCase().includes(phrase)
  );
  confidence += hasUncertainty ? 0 : 20;
  
  // Signal 4: Number of relevant articles found (0-20 points)
  confidence += Math.min(retrievedArticles.length / 5, 1) * 20;
  
  return confidence / 100; // Normalize to 0-1
}
```

### Escalation Rules

The system escalates to a human agent when:

1. **Low Confidence**: Confidence score < 0.7
2. **Explicit Request**: Customer says "speak to a human", "agent", etc.
3. **Sensitive Operations**: Refunds, account changes, billing issues
4. **Repeated Failures**: Same customer has 3+ unresolved AI interactions
5. **High Priority**: Ticket marked as urgent or high priority

---

## Training and Improvement

### Initial Setup

To set up the AI agent for a new organization:

1. **Import Knowledge Base**: Upload existing documentation, FAQs, and policies
2. **Generate Embeddings**: Process all articles through the embedding model
3. **Test Queries**: Run 50+ test questions to validate retrieval accuracy
4. **Set Confidence Threshold**: Start with 0.7, adjust based on escalation rate
5. **Enable Monitoring**: Track response quality and customer satisfaction

### Continuous Improvement

The AI agent improves over time through several mechanisms:

**Human Review**: Agents review AI responses and mark them as helpful or unhelpful. Unhelpful responses are analyzed to identify knowledge gaps or retrieval failures.

**Knowledge Base Updates**: When the AI fails to answer a question, agents can create new knowledge base articles or update existing ones. The system automatically regenerates embeddings for updated content.

**Fine-Tuning**: Periodically, approved AI responses are used to fine-tune the LLM, improving its ability to generate appropriate responses for the specific business domain.

**A/B Testing**: Different prompts, confidence thresholds, and retrieval strategies are tested with a subset of conversations to identify optimal configurations.

### Metrics to Monitor

Track these metrics to evaluate AI agent performance:

- **Accuracy**: % of AI responses marked as helpful by agents
- **Escalation Rate**: % of conversations escalated to humans
- **Resolution Rate**: % of tickets fully resolved by AI
- **Response Time**: Average time from question to answer
- **Customer Satisfaction**: CSAT score for AI-handled tickets
- **Coverage**: % of ticket categories the AI can handle

**Target Metrics:**
- Accuracy: > 85%
- Escalation Rate: < 20%
- Resolution Rate: > 60%
- Response Time: < 3 seconds
- CSAT: > 4.0/5.0
- Coverage: > 70% of categories

---

## Best Practices

### Knowledge Base Management

**Structure Articles Clearly**: Use descriptive titles, clear headings, and bullet points. The AI performs better with well-structured content.

**Keep Content Updated**: Review and update articles quarterly. Outdated information leads to incorrect responses.

**Use Consistent Terminology**: Standardize product names, policy terms, and procedures across all articles.

**Tag Appropriately**: Add relevant tags to improve retrieval accuracy. Use both broad categories (shipping) and specific tags (international-shipping).

**Include Examples**: Real-world examples help the AI understand context and generate more relevant responses.

### Prompt Engineering

**Be Specific**: Clearly define the AI's role, tone, and constraints in the system prompt.

**Provide Context**: Include relevant business information (return policy duration, shipping carriers, etc.) in the prompt.

**Set Boundaries**: Explicitly tell the AI what it should NOT do (don't make promises, don't access accounts, etc.).

**Test Variations**: Experiment with different prompt structures to find what works best for your use case.

### Escalation Strategy

**Escalate Early**: It's better to escalate too often than to provide incorrect information.

**Explain Escalations**: When escalating, tell the customer why ("This requires account access, which I'll connect you to an agent for").

**Track Escalation Reasons**: Analyze why conversations are escalated to identify knowledge gaps.

**Enable Seamless Handoff**: Provide the human agent with full conversation context and AI-suggested solutions.

---

## Security and Privacy

### Data Handling

- **No PII in Knowledge Base**: Never include customer names, emails, or personal information in knowledge base articles
- **Encrypted Storage**: All AI-generated responses and conversation logs are encrypted at rest
- **Access Controls**: Only authorized personnel can view AI conversation logs
- **Data Retention**: Conversation logs are retained for 90 days, then automatically deleted

### Compliance

The AI agent is designed to comply with:

- **GDPR**: Customers can request deletion of their conversation history
- **CCPA**: California residents have right to access and delete their data
- **CAN-SPAM**: AI-generated emails include proper unsubscribe mechanisms
- **Accessibility**: Responses are compatible with screen readers and assistive technologies

---

## Future Enhancements

### Planned Features

**Multilingual Support**: Detect customer language and respond in their preferred language using translation models.

**Proactive Outreach**: AI identifies customers who might need help (delayed shipments, abandoned carts) and reaches out proactively.

**Voice Integration**: Extend AI agent to handle phone calls using speech-to-text and text-to-speech.

**Sentiment Analysis**: Detect frustrated customers and prioritize escalation to prevent churn.

**Personalization**: Use customer history and preferences to tailor responses.

---

## Conclusion

The AI customer service agent significantly reduces support workload while maintaining high customer satisfaction. By combining retrieval-augmented generation with confidence scoring and human escalation, the system provides accurate, helpful responses while knowing its limitations.

Success depends on maintaining a high-quality knowledge base, monitoring performance metrics, and continuously improving based on feedback. With proper implementation and ongoing optimization, the AI agent can handle 60-80% of common inquiries, freeing human agents to focus on complex issues that require empathy and judgment.

For implementation details, see [ARCHITECTURE.md](ARCHITECTURE.md) and [IMPLEMENTATION_STRATEGY.md](IMPLEMENTATION_STRATEGY.md).
