import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

// Conditionally create the driver only if all credentials are provided
const driver = (uri && user && password) 
  ? neo4j.driver(uri, neo4j.auth.basic(user, password)) 
  : null;

if (!driver) {
    console.warn('Neo4j environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD) are not fully set in .env. Neo4j integration will be disabled.');
}


/**
 * Executes a write transaction against the Neo4j database.
 * Use this for creating, updating, or deleting nodes and relationships.
 * @param cypher - The Cypher query to execute.
 * @param params - The parameters to pass to the Cypher query.
 * @returns The result of the query.
 */
export async function write(cypher: string, params: Record<string, any>) {
  if (!driver) {
    console.warn('Neo4j driver not initialized. Skipping write operation.');
    return;
  }
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });
  try {
    const result = await session.executeWrite(tx => tx.run(cypher, params));
    return result;
  } finally {
    await session.close();
  }
}

/**
 * Executes a read transaction against the Neo4j database.
 * Use this for reading data.
 * @param cypher - The Cypher query to execute.
 * @param params - The parameters to pass to the Cypher query.
 * @returns The result of the query.
 */
export async function read(cypher: string, params: Record<string, any>) {
    if (!driver) {
    console.warn('Neo4j driver not initialized. Skipping read operation.');
    return;
  }
  const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });
  try {
    const result = await session.executeRead(tx => tx.run(cypher, params));
    return result;
  } finally {
    await session.close();
  }
}

/**
 * Adds nodes and edges from a conceptual data model to the Neo4j graph.
 * @param nodes - An array of node objects to add.
 * @param edges - An array of edge objects to add.
 */
export async function addConceptsToGraph(nodes: any[], edges: any[]) {
    if (!driver) {
        console.warn('Neo4j driver not initialized. Skipping graph update.');
        return;
    }
    const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' });
    try {
        await session.executeWrite(async tx => {
            // Create nodes
            for (const node of nodes) {
                // Cypher labels cannot contain spaces or special characters, so we sanitize the type
                const safeNodeType = node.type.replace(/[^a-zA-Z0-9_]/g, '');
                await tx.run(
                    // Using MERGE to avoid duplicate nodes based on their unique ID
                    `MERGE (n:${safeNodeType} {id: $id}) SET n.label = $label, n.description = $description`,
                    { id: node.id, label: node.label, description: node.description || null }
                );
            }
            // Create relationships
            for (const edge of edges) {
                 // Cypher relationship types cannot contain hyphens
                 const safeRelationshipType = edge.relationship.replace(/-/g, '_').toUpperCase();
                 await tx.run(
                    `MATCH (a {id: $source}), (b {id: $target})
                     MERGE (a)-[r:${safeRelationshipType}]->(b)
                     SET r.description = $description, r.weight = $weight`,
                    { source: edge.source, target: edge.target, description: edge.description || null, weight: edge.weight || null }
                );
            }
        });
        console.log(`[Neo4j] Wrote ${nodes.length} nodes and ${edges.length} edges to the graph.`);
    } catch (error) {
        console.error("[Neo4j] Error writing to graph:", error);
        // Don't re-throw the error, just log it. We don't want DB issues to crash the flow.
    } finally {
        await session.close();
    }
}
