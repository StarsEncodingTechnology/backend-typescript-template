import * as path from "path";
import moduleAlias from "module-alias";

// Configuração para o alias funcionar em toda a aplicação
// inclusive no compilado

const files = path.resolve(__dirname, "../..");

moduleAlias.addAliases({
  "@src": path.join(files, "src"),
  "@test": path.join(files, "test"),
});
