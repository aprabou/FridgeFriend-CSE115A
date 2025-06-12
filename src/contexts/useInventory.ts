// Defines a custom React hook, useInventory, that gives access to the InventoryContext for managing inventory related operations
import { useContext } from "react";
import { InventoryContext } from "./InventoryContext";

export const useInventory = () => {
  return useContext(InventoryContext);
};
