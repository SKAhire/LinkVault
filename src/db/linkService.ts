import { Link, LinkInput } from "../types";
import { extractDomain } from "../utils/extractDomain";
import { getDatabase } from "./database";

export const getLinksByCategory = async (
  categoryId: number,
): Promise<Link[]> => {
  const database = await getDatabase();

  const links = await database.getAllAsync<Link>(
    "SELECT * FROM links WHERE categoryId = ? ORDER BY createdAt DESC",
    [categoryId],
  );

  return links;
};

export const getLinkById = async (id: number): Promise<Link | null> => {
  const database = await getDatabase();

  const link = await database.getFirstAsync<Link>(
    "SELECT * FROM links WHERE id = ?",
    [id],
  );

  return link || null;
};

export const createLink = async (input: LinkInput): Promise<Link> => {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const domain = extractDomain(input.url);

  const result = await database.runAsync(
    "INSERT INTO links (url, domain, categoryId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
    [input.url, domain, input.categoryId, now, now],
  );

  return {
    id: result.lastInsertRowId,
    url: input.url,
    domain,
    categoryId: input.categoryId,
    createdAt: now,
    updatedAt: now,
  };
};

export const updateLink = async (
  id: number,
  input: LinkInput,
): Promise<void> => {
  const database = await getDatabase();
  const now = new Date().toISOString();
  const domain = extractDomain(input.url);

  await database.runAsync(
    "UPDATE links SET url = ?, domain = ?, categoryId = ?, updatedAt = ? WHERE id = ?",
    [input.url, domain, input.categoryId, now, id],
  );
};

export const deleteLink = async (id: number): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync("DELETE FROM links WHERE id = ?", [id]);
};

export const searchLinks = async (
  categoryId: number,
  query: string,
): Promise<Link[]> => {
  const database = await getDatabase();

  const links = await database.getAllAsync<Link>(
    `SELECT * FROM links 
     WHERE categoryId = ? AND (url LIKE ? OR domain LIKE ?) 
     ORDER BY createdAt DESC`,
    [categoryId, `%${query}%`, `%${query}%`],
  );

  return links;
};

export const getAllLinks = async (): Promise<Link[]> => {
  const database = await getDatabase();

  const links = await database.getAllAsync<Link>(
    "SELECT * FROM links ORDER BY createdAt DESC",
  );

  return links;
};
