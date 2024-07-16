import { Injectable } from '@angular/core';

const DB_NAME = 'WALLET_CONNECT_V2_INDEXED_DB';
const DB_VERSION = 1;
const TABLE_NAME = 'keyvaluestorage';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  public async clearTable(): Promise<void> {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.addEventListener('error', event => {
      console.log(event);
      throw new Error('Error opening database: ');
    });

    request.onsuccess = event => {
      const db = (event.target as IDBOpenDBRequest)?.result;
      const transaction = db?.transaction([TABLE_NAME], 'readwrite');
      const objectStore = transaction?.objectStore(TABLE_NAME);
      const clearRequest = objectStore?.clear();

      clearRequest.addEventListener('error', event => {
        console.log(event);
        throw new Error('Error clearing data in the table');
      });

      transaction.oncomplete = () => {
        db.close();
      };
    };
  }
}
