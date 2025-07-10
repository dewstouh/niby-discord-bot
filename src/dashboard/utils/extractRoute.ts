export default function extractRoute(filePath) {
   const baseDir = `${process.cwd()}/dist/dashboard/routes`;
   const routeParts = filePath.split(baseDir)[1].split('/');
   const filteredParts = routeParts.filter(part => part !== '' && part !== 'index');
   const route = '/' + filteredParts.join('/');
   return route;
}
