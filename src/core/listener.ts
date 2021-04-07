/**
 * Listener for TOML files.
 * Filters active editor files according to the extension.
 */
import { TextEditor, workspace } from "vscode";
import { parse, filterCrates } from "../toml/parser";
import { statusBarItem } from "../ui/indicators";
import { status } from "../toml/commands";
import Item from "./Item";
import decorate, { decorationHandle } from "../ui/decorator";
import { fetchCrateVersions } from "./fetcher";
import quickFillDependencies from "./quickFill";
import Dependency from "./Dependency";

function parseToml(text: string): Item[] {
  console.log("Parsing...");
  const toml = parse(text);
  const tomlDependencies = filterCrates(toml.values);
  console.log("Parsed");
  statusBarItem.setText("Cargo.toml parsed");
  return tomlDependencies;
}

var dependencies: Item[];
var fetchedDeps: Dependency[];
var fetchedDepsMap: Map<string, Dependency>;
export { dependencies, fetchedDeps, fetchedDepsMap };

export async function parseAndDecorate(
  editor: TextEditor,
  wasSaved: boolean = false,
  fetchDeps: boolean = true
) {
  const text = editor.document.getText();
  const config = workspace.getConfiguration("", editor.document.uri);
  const shouldListPreRels = config.get("crates.listPreReleases");
  const basicAuth = config.get<string>("crates.githubAuthBasic");
  const useLocalIndex = config.get<boolean>("crates.useLocalCargoIndex");
  const localIndexHash = config.get<string>("crates.localCargoIndexHash");
  const localGitBranch = config.get<string>("crates.localCargoIndexBranch");
  const githubToken = basicAuth
    ? `Basic ${Buffer.from(basicAuth).toString("base64")}`
    : undefined;

  try {
    
    // Parse
    dependencies = parseToml(text);
    if (fetchDeps) {
      const data = fetchCrateVersions(
        dependencies,
        !!shouldListPreRels,
        githubToken,
        useLocalIndex,
        localIndexHash,
        localGitBranch
      );
      fetchedDeps = await data[0];
      fetchedDepsMap = data[1];
    }

    // Fill in crate = "?" with the latest fetched version
    if (wasSaved)
      await quickFillDependencies(editor, dependencies, fetchedDeps);

    decorate(editor, fetchedDeps);

  } catch (e) {
    console.error(e);
    statusBarItem.setText("Cargo.toml is not valid!");
    if (decorationHandle) {
      decorationHandle.dispose();
    }
  }
}

export default async function listener(
  editor: TextEditor | undefined,
  wasSaved: boolean = false
): Promise<void> {
  if (editor) {
    const { fileName } = editor.document;
    if (fileName.toLocaleLowerCase().endsWith("cargo.toml")) {
      status.inProgress = true;
      status.replaceItems = [];
      statusBarItem.show();
      await parseAndDecorate(editor, wasSaved);
    } else {
      statusBarItem.hide();
    }
    status.inProgress = false;
  } else {
    console.log("No active editor found.");
  }
  return Promise.resolve();
}
