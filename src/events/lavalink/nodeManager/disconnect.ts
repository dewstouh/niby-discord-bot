import LavalinkManager from "../../../structures/LavalinkManager";
export default (manager:LavalinkManager, node, reason) => {
   console.log(node.id, " :: DISCONNECT :: ", reason);
};
