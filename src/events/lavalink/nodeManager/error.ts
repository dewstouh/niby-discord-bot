import LavalinkManager from "../../../structures/LavalinkManager";
export default (manager:LavalinkManager, node, error, payload) => {
   console.error(node.id, " :: ERRORED :: ", error, payload);
  };
