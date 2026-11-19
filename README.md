# Claude mods

Personal mods and themes for Claude Code and the Claude desktop app. The repository is a plugin marketplace, so each mod installs with one line.

## Stained Glass theme

A Gothic stained-glass theme for the desktop and mobile apps, after the windows of the Sainte-Chapelle in Paris. Seven tall lancets stand behind the conversation, each crowned with a small rose and filled with jewelled medallions (no two alike) on grounds of gold fleurs-de-lis on blue and castles on red. They are set in sunlit limestone in light mode and a dark nave in dark mode. The interface colours follow: jewel-toned accents on limestone or deep violet panels. The backdrop is static, so it costs almost nothing once drawn.

Switch it at any time:

- `/glass on`: colours and the stained-glass windows
- `/glass calm`: colours only, no windows (lightest on the machine)
- `/glass off`: the app's own look
- `/glass`: show the current mode

The choice is remembered across sessions.

## Install

At the prompt of a terminal session:

```
/plugin install stained-glass-theme --marketplace mesutyigit1776/claude-mods
```

Answer `y` to add the marketplace, then press Enter for the user scope.

From a shell:

```bash
claude plugin install stained-glass-theme --marketplace mesutyigit1776/claude-mods
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `mesutyigit1776/claude-mods`, then Add plugin.

Themes draw in the desktop and mobile apps; a terminal shows the commands but no backdrop.

## Changing the windows

The backdrop is generated. Edit `stained-glass-theme/scripts/cathedral.mjs`, then run:

```bash
node stained-glass-theme/scripts/cathedral.mjs
```

It rewrites `hooks/scene-cathedral.js` and reports the size against the app's 131,072-character limit. Run `/reload-plugins` to see the result.

## Uninstall

```bash
claude plugin uninstall stained-glass-theme
```
