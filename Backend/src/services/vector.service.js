// Import the Pinecone library
import { Pinecone } from '@pinecone-database/pinecone'

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create an index for dense vectors with integrated embedding

const ChatGptindex = pc.Index("chat-gpt-new");


const createMemory = async ({ vectors, metadata, messageId }) => {

    await ChatGptindex.upsert([ {
        id: messageId,
        values: vectors,
        metadata,
    }])
}


const queryMemory = async ({ queryVector, limit = 5, metadata }) => {
    const data = await ChatGptindex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true
    })

    return data.matches
}

export { createMemory, queryMemory}