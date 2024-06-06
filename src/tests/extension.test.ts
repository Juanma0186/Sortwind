import { describe, expect, test } from "@jest/globals";
import { sortClassString } from "../utils";
import { defaultOrder } from "../classes";
import { workspace } from "vscode";

const config = workspace.getConfiguration();
const sortOrder: string[] = config.get("sortwind.order") || defaultOrder;

describe("sortClassString", () => {
  test("Debería eliminar duplicados", () => {
    const classString = "z-10 text-black bg-white bg-white bg-white";

    const options = { shouldRemoveDuplicates: true };

    const result = sortClassString(classString, sortOrder, options);

    expect(result).toBe("z-10 text-black bg-white");
  });

  test("Debería mantener duplicados", () => {
    const classString = "z-10 text-black bg-white bg-white bg-white";

    const options = { shouldRemoveDuplicates: false };

    const result = sortClassString(classString, sortOrder, options);

    expect(result).toBe("z-10 text-black bg-white bg-white bg-white");
  });

  test("Debería ordenar las clases existentes en el array según el sortOrder", () => {
    const classString = "absolute opacity-0 scale-75 top-8 right-0 text-sm p-1";

    const options = { shouldRemoveDuplicates: true };

    const result = sortClassString(classString, sortOrder, options);

    expect(result).toBe(
      "absolute right-0 top-8 p-1 text-sm opacity-0 scale-75"
    );
  });

  test("Debería ordenar las clases existentes en el array según el sortOrder y quitar los duplicados", () => {
    const classString =
      "absolute opacity-0 scale-75 top-8 right-0 text-sm p-1 bg-white bg-white";

    const options = { shouldRemoveDuplicates: true };

    const result = sortClassString(classString, sortOrder, options);

    expect(result).toBe(
      "absolute right-0 top-8 p-1 text-sm bg-white opacity-0 scale-75"
    );
  });

  test("Debería ordenar las clases existentes en el array según el sortOrder y ordenar las clases con prefijos y moverlas al final del array de clases", () => {
    const classString =
      "hover:scale-75 dark:hover:text-purple-400 size-5 hover:text-purple-600 absolute transition-all";

    const options = { shouldRemoveDuplicates: false };

    const result = sortClassString(classString, sortOrder, options);

    expect(result).toBe(
      "size-5 absolute transition-all dark:hover:text-purple-400 hover:text-purple-600 hover:scale-75"
    );
  });

  test("Debería ordenar las clases creadas por el usuario y que no pertenecen al array de ordenación por orden alfabético", () => {
    const classString = " btn-primary btn-submit btn";

    const options = { shouldRemoveDuplicates: false };

    const result = sortClassString(classString, sortOrder, options);

    expect(result).toBe("btn btn-primary btn-submit");
  });
});
