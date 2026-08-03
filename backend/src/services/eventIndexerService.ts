import { pool } from "../database/connection";
import logger from "../utils/logger";
import { Server } from "stellar-sdk";

export const indexTransaction = async (data: {
  cooperativeId: string;
  txHash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  asset: string;
  ledgerSequence: number;
  timestamp: number;
}) => {
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO indexed_transactions (id, cooperative_id, tx_hash, type, from_address, to_address, amount, asset, ledger_sequence, timestamp, processed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
    [
      id,
      data.cooperativeId,
      data.txHash,
      data.type,
      data.from,
      data.to,
      data.amount,
      data.asset,
      data.ledgerSequence,
      data.timestamp,
    ]
  );

  logger.info("Transaction indexed", { txHash: data.txHash, type: data.type });
  return { id, indexed: true };
};

export const getIndexedTransactions = async (cooperativeId: string, start: number, limit: number) => {
  const result = await pool.query(
    "SELECT * FROM indexed_transactions WHERE cooperative_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3",
    [cooperativeId, limit, start]
  );
  return result.rows;
};

export const syncFromHorizon = async (cooperativeId: string, accountId: string) => {
  const horizonUrl = process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
  const server = new Server(horizonUrl);

  const operations = await server.operations().forAccount(accountId).limit(50).call();

  for (const op of operations.records) {
    await indexTransaction({
      cooperativeId,
      txHash: op.id,
      type: op.type,
      from: op.source || accountId,
      to: op.to || accountId,
      amount: op.amount || "0",
      asset: op.asset_type || "native",
      ledgerSequence: op.paging_tokens ? parseInt(op.paging_tokens[0], 10) : 0,
      timestamp: op.created_at ? new Date(op.created_at).getTime() / 1000 : 0,
    });
  }

  return { synced: operations.records.length, cooperativeId };
};