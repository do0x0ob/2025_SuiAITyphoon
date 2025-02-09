import { bcs } from "@mysten/sui/bcs";
import { Transaction as TX } from "@mysten/sui/transactions";

// 合約常量
const PACKAGE_ID = '0x0ae688e13bf8361b74153652fc5f95993341fd85a99aa4b6ba727add1e1754f1';
const STATE_ID = '0x7b50f719b346eff07f501faa506322bedb54ad1154cf40b6be84351972d36822';

export const mintOS = async (username: string, settings_blob: string = "") => {
  console.log('mintOS params:', username, settings_blob);
  
  const tx = new TX();
  tx.moveCall({
    target: `${PACKAGE_ID}::memento::mint_os`,
    arguments: [
      tx.object(STATE_ID),
      tx.pure(bcs.string().serialize(username).toBytes()),
      tx.pure(bcs.string().serialize(settings_blob).toBytes()),
    ],
  });
  return tx;
}; 