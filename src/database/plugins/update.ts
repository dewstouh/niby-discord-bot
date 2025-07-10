/* Plugin para reestablecer la caché del schema al actualizar un documento */

export default function updateOnePlugin(schema): void {
   schema.pre('updateOne', { document: true, query: false }, () => {
     console.log('Updating');
   });
 }
