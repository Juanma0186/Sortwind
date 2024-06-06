"use strict";

import { commands, workspace, ExtensionContext, Range, window } from "vscode";
import { sortClassString, getTextMatch, buildMatchers } from "./utils";
import { defaultOrder } from "./classes";

export type LangConfig =
  | string
  | string[]
  | { regex?: string | string[]; separator?: string; replacement?: string }
  | undefined;

const config = workspace.getConfiguration();
const langConfig: { [key: string]: LangConfig | LangConfig[] } =
  config.get("sortwind.classRegex") || {};

//Mostramos el langConfig por mensaje

const sortOrder = config.get("sortwind.order") || defaultOrder;

// const customTailwindPrefixConfig = config.get("sortwind.customTailwindPrefix");
// const customTailwindPrefix =
//   typeof customTailwindPrefixConfig === "string"
//     ? customTailwindPrefixConfig
//     : "";

const shouldRemoveDuplicatesConfig = config.get("sortwind.removeDuplicates");
const shouldRemoveDuplicates =
  typeof shouldRemoveDuplicatesConfig === "boolean"
    ? shouldRemoveDuplicatesConfig
    : true;

// const shouldPrependCustomClassesConfig = config.get(
//   "sortwind.prependCustomClasses"
// );
// const shouldPrependCustomClasses =
//   typeof shouldPrependCustomClassesConfig === "boolean"
//     ? shouldPrependCustomClassesConfig
//     : false;

export function activate(context: ExtensionContext) {
  let disposable = commands.registerTextEditorCommand(
    "sortwind.sortTailwindClasses",
    function (editor, edit) {
      const editorText = editor.document.getText();
      const editorLangId = editor.document.languageId;

      const matchers = buildMatchers(
        langConfig[editorLangId] || langConfig["html"]
      );

      for (const matcher of matchers) {
        getTextMatch(matcher.regex, editorText, (text, startPosition) => {
          const endPosition = startPosition + text.length;
          const range = new Range(
            editor.document.positionAt(startPosition),
            editor.document.positionAt(endPosition)
          );

          const options = {
            shouldRemoveDuplicates,
            separator: matcher.separator,
            replacement: matcher.replacement,
          };

          edit.replace(
            range,
            sortClassString(
              text,
              Array.isArray(sortOrder) ? sortOrder : [],
              options
            )
          );
        });
      }
    }
  );

  context.subscriptions.push(disposable);

  // if runOnSave is enabled organize tailwind classes before saving
  if (config.get("sortwind.runOnSave")) {
    context.subscriptions.push(
      workspace.onWillSaveTextDocument((_e) => {
        commands.executeCommand("sortwind.sortTailwindClasses");
        window.showInformationMessage("Tailwind classes organized!");
      })
    );
  }
}
