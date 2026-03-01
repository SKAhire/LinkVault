import { Link, LinkInput } from "../types";
import { extractDomain } from "../utils/extractDomain";
import { getDatabase } from "./database";

export const getLinksByCategory = async (
  categoryId: number,
): Promise<Link[]> => {
  try {
    const database = await getDatabase();

    const links = await database.getAllAsync<Link>(
      "SELECT * FROM links WHERE categoryId = ? ORDER BY createdAt DESC",
      [categoryId],
    );

    return links;
  } catch (error) {
    console.error("[LinkService] getLinksByCategory error:", error);
    throw error;
  }
};

export const getLinkById = async (id: number): Promise<Link | null> => {
  try {
    const database = await getDatabase();

    const link = await database.getFirstAsync<Link>(
      "SELECT * FROM links WHERE id = ?",
      [id],
    );

    return link || null;
  } catch (error) {
    console.error("[LinkService] getLinkById error:", error);
    throw error;
  }
};

export const createLink = async (input: LinkInput): Promise<Link> => {
  try {
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
  } catch (error) {
    console.error("[LinkService] createLink error:", error);
    throw error;
  }
};

export const updateLink = async (
  id: number,
  input: LinkInput,
): Promise<void> => {
  try {
    const database = await getDatabase();
    const now = new Date().toISOString();
    const domain = extractDomain(input.url);

    await database.runAsync(
      "UPDATE links SET url = ?, domain = ?, categoryId = ?, updatedAt = ? WHERE id = ?",
      [input.url, domain, input.categoryId, now, id],
    );
  } catch (error) {
    console.error("[LinkService] updateLink error:", error);
    throw error;
  }
};

export const deleteLink = async (id: number): Promise<void> => {
  try {
    const database = await getDatabase();

    await database.runAsync("DELETE FROM links WHERE id = ?", [id]);
  } catch (error) {
    console.error("[LinkService] deleteLink error:", error);
    throw error;
  }
};

export const searchLinks = async (
  categoryId: number,
  query: string,
): Promise<Link[]> => {
  try {
    const database = await getDatabase();

    const links = await database.getAllAsync<Link>(
      `SELECT * FROM links 
       WHERE categoryId = ? AND (url LIKE ? OR domain LIKE ?) 
       ORDER BY createdAt DESC`,
      [categoryId, `%${query}%`, `%${query}%`],
    );

    return links;
  } catch (error) {
    console.error("[LinkService] searchLinks error:", error);
    throw error;
  }
};

export const getAllLinks = async (): Promise<Link[]> => {
  try {
    const database = await getDatabase();

    const links = await database.getAllAsync<Link>(
      "SELECT * FROM links ORDER BY createdAt DESC",
    );

    return links;
  } catch (error) {
    console.error("[LinkService] getAllLinks error:", error);
    throw error;
  }
};
