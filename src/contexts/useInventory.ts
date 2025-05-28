import { useContext } from "react";
import { InventoryContext } from "./InventoryContext";

export const useInventory = () => {
  return useContext(InventoryContext);
};
