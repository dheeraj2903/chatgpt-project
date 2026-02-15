const { pipeline } = require ("@xenova/transformers");

let embedder;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return embedder;
}

 async function embedText(text) {
  const model = await getEmbedder();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return output.data; // 384-dimension vector
}


module.exports = {embedText};