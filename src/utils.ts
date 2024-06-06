import { window } from "vscode";
import { LangConfig } from "./extension";

export interface Options {
  shouldRemoveDuplicates: boolean;
  separator?: RegExp;
  replacement?: string;
}

/**
 * Sorts a string of CSS classes according to a predefined order.
 * @param classString The string to sort
 * @param sortOrder The default order to sort the array at
 *
 * @returns The sorted string
 */
export const sortClassString = (
  classString: string,
  sortOrder: string[],
  options: Options
): string => {
  let classArray = classString.split(options.separator || /\s+/g);

  if (options.shouldRemoveDuplicates) {
    classArray = removeDuplicates(classArray);
  }

  const sortOrderClone = [...sortOrder];

  classArray = sortClassArray(classArray, sortOrderClone);

  return classArray.join(options.replacement || " ").trim();
};

const sortClassArray = (
  classArray: string[],
  sortOrder: string[]
): string[] => {
  // Separar las clases en tres grupos: sin prefijo y no en el orden, sin prefijo y en el orden, y con prefijo
  const noPrefixNoOrder = classArray.filter(
    (el) => sortOrder.indexOf(el) === -1 && !el.includes(":")
  );
  const noPrefixOrder = classArray.filter(
    (el) => sortOrder.indexOf(el) !== -1 && !el.includes(":")
  );
  const withPrefix = classArray.filter((el) => el.includes(":"));

  //Ordenar alfabéticamente las clases sin prefijo que no están en el orden
  noPrefixNoOrder.sort();

  // Ordenar las clases sin prefijo que están en el orden
  noPrefixOrder.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));

  // Ordenar las clases con prefijo por el prefijo y, dentro de cada prefijo, por el orden predefinido
  withPrefix.sort((a, b) => {
    const prefixA = a.substring(0, a.lastIndexOf(":"));
    const prefixB = b.substring(0, b.lastIndexOf(":"));
    if (prefixA !== prefixB) {
      return prefixA.localeCompare(prefixB);
    } else {
      const classA = a.substring(a.lastIndexOf(":") + 1);
      const classB = b.substring(b.lastIndexOf(":") + 1);
      return sortOrder.indexOf(classA) - sortOrder.indexOf(classB);
    }
  });

  // Devolver la concatenación de los tres grupos en el orden correcto
  return [...noPrefixNoOrder, ...noPrefixOrder, ...withPrefix];
};

const removeDuplicates = (classArray: string[]): string[] => [
  ...new Set(classArray),
];

function isArrayOfStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export type Matcher = {
  regex: RegExp[];
  separator?: RegExp;
  replacement?: string;
};

function buildMatcher(value: LangConfig): Matcher {
  if (typeof value === "string") {
    return {
      regex: [new RegExp(value, "gi")],
    };
  } else if (isArrayOfStrings(value)) {
    return {
      regex: value.map((v) => new RegExp(v, "gi")),
    };
  } else if (value === undefined) {
    return {
      regex: [],
    };
  } else {
    return {
      regex:
        typeof value.regex === "string"
          ? [new RegExp(value.regex, "gi")]
          : isArrayOfStrings(value.regex)
          ? value.regex.map((v) => new RegExp(v, "gi"))
          : [],
      separator:
        typeof value.separator === "string"
          ? new RegExp(value.separator, "g")
          : undefined,
      replacement: value.replacement || value.separator,
    };
  }
}

export function buildMatchers(value: LangConfig | LangConfig[]): Matcher[] {
  if (value === undefined) {
    return [];
  } else if (Array.isArray(value)) {
    if (!value.length) {
      return [];
    } else if (!isArrayOfStrings(value)) {
      return value.map((v) => buildMatcher(v));
    }
  }
  return [buildMatcher(value)];
}

export function getTextMatch(
  regexes: RegExp[],
  text: string,
  callback: (text: string, startPosition: number) => void,
  startPosition: number = 0
): void {
  if (regexes.length >= 1) {
    let wrapper: RegExpExecArray | null;
    while ((wrapper = regexes[0].exec(text)) !== null) {
      const wrapperMatch = wrapper[0];
      const valueMatchIndex = wrapper.findIndex(
        (match, idx) => idx !== 0 && match
      );
      const valueMatch = wrapper[valueMatchIndex];

      const newStartPosition =
        startPosition + wrapper.index + wrapperMatch.lastIndexOf(valueMatch);

      if (regexes.length === 1) {
        callback(valueMatch, newStartPosition);
      } else {
        getTextMatch(regexes.slice(1), valueMatch, callback, newStartPosition);
      }
    }
  }
}
