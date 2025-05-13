# Leitstellenspiel Helper - GitHub Copilot Instructions

## Project Context
- This project is a Tampermonkey UserScript designed for the game "Leitstellenspiel."
- The script enhances the game's interface by adding features for managing vehicles, missions, and other resources.
- It uses JavaScript and DOM manipulation to extend the game's functionality.

## Generic instructions
* use english only

## Key Guidelines for GitHub Copilot
1. **Code Style and Structure**:
   - Follow the existing code structure and conventions.
   - Write clean, modular, and well-documented code.

2. **Performance**:
   - Ensure the script runs efficiently as it operates in real-time within the browser.
   - Avoid introducing performance bottlenecks.

3. **Compatibility**:
   - Use only modern JavaScript features supported by most browsers.
   - Avoid dependencies on external libraries not already included in the project.

4. **Functionality**:
   - Focus on improving or extending existing features, such as:
     - Automatic vehicle assignment.
     - Mission sorting and filtering.
     - UI enhancements for better usability.
   - Do not alter the core functionality of the game.

5. **Settings and Data**:
   - The script uses `localStorage` for storing user settings.
   - Additional data (e.g., vehicle types, scenes) is fetched from external sources like GitHub.

6. **Error Handling**:
   - Add proper error handling and logging for debugging purposes.
   - Use `console.debug`, `console.log`, `console.warn`, and `console.error` as appropriate.

7. **Comments**:
   - Add meaningful comments to explain complex logic or important sections of the code.

## Notes for Copilot
- Avoid generating code that conflicts with the game's original behavior.
- Prioritize user experience and maintain a clean UI.
- Suggest optimizations for existing functions where applicable.
