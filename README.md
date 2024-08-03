# CratesX: Simplify Dependency Management in Rust & VSCode

> This project has been forked from [crates](https://github.com/serayuzgur/crates) since August of 2024, but a lot has changed; For more details, see Changelog.

## Features

CratesX offers a range of powerful features to streamline your Rust development workflow:

1. **Version Information**: CratesX provides comprehensive version information to keep you informed about the crates in your project. This includes a tooltip with detailed version details and inline visual feedback for quick reference and decision-making.
   ![Tooltip with Version Information](https://github.com/cijiugechu/cratesx/raw/main/screenshots/tooltip.png)

2. **Shortcut Commands**: Update all dependencies with just one command for a seamless workflow.
   ![Update All Dependencies](https://github.com/cijiugechu/cratesx/raw/main/screenshots/update_all.png)

3. **Crev Integration**: Access valuable code reviews and community collaboration through the integration with [Crev](https://web.crev.dev/). Get feedback and make informed decisions about the crates you depend on.
   ![Crev Integration](https://github.com/cijiugechu/cratesx/raw/main/screenshots/crev_dev.png)

4. **Doc.rs Integration**: Explore comprehensive documentation for Rust, including crates, libraries, and more, with the seamless integration of [Doc.rs](https://doc.rs/). Gain in-depth knowledge and insights to enhance your coding experience.
   ![Doc.rs Integration](https://github.com/cijiugechu/cratesx/raw/main/screenshots/docs_rs.png)

## Getting Started

Using Crates is incredibly simple. Just install the extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=nemurubaka.cratesx), and you're ready to go!

## Configuration Options

While Crates works out-of-the-box without any configuration, we also offer a few customizable options:

### settings.json

- `cratesx.listPreReleases`: Enable this option to list pre-release versions in hover and decorations. By default, it is set to false.

- `cratesx.indexServerURL`: Specify a custom URL for the crates.io index server. The default value connects to the official index.

- `cratesx.errorDecorator`: Customize the text displayed when a dependency has errors. The default is `❗️❗️❗`.

- `cratesx.compatibleDecorator`: Define the text template to show when a dependency is semver compatible. `${version}` will be replaced by the latest version info. The default is `✅`.

- `cratesx.incompatibleDecorator`: Set the text template to show when a dependency is not semver compatible. `${version}` will be replaced by the latest version info. The default is `❌ ${version}`.

### Cargo.toml

- `# crates: disable-check`: Disable version check for this specific dependency.


