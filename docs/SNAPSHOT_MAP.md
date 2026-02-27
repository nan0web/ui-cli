# 🗺️ UI-CLI Snapshot Test Map

This document serves as the **100% Orientir** for the CLI project's visual state. Each scenario is backed by automated snapshot tests (Golden Masters) that capture exact terminal output including decorations, icons, and indentation.

## 📊 Test Coverage Summary

| Scenario                 | Description                              | English Snapshot                                                               | Ukrainian Snapshot                                                             |
| :----------------------- | :--------------------------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Select**               | Basic single selection from a list       | [select.en.snap](/play/snapshots/select.en.snap)                               | [select.uk.snap](/play/snapshots/select.uk.snap)                               |
| **Form (Valid)**         | Linear form with valid inputs            | [form_valid.en.snap](/play/snapshots/form_valid.en.snap)                       | [form_valid.uk.snap](/play/snapshots/form_valid.uk.snap)                       |
| **Form (Errors)**        | Linear form with validation errors       | [form_validation_error.en.snap](/play/snapshots/form_validation_error.en.snap) | [form_validation_error.uk.snap](/play/snapshots/form_validation_error.uk.snap) |
| **Tree View**            | Static tree navigation                   | [tree_view.en.snap](/play/snapshots/tree_view.en.snap)                         | [tree_view.uk.snap](/play/snapshots/tree_view.uk.snap)                         |
| **Tree Search**          | Interactive tree with TAB live-search    | [tree_search.en.snap](/play/snapshots/tree_search.en.snap)                     | [tree_search.uk.snap](/play/snapshots/tree_search.uk.snap)                     |
| **Autocomplete**         | Searchable list with real-time filtering | [autocomplete.en.snap](/play/snapshots/autocomplete.en.snap)                   | [autocomplete.uk.snap](/play/snapshots/autocomplete.uk.snap)                   |
| **Advanced Form**        | Masks, passwords, and multi-field logic  | [advanced_form.en.snap](/play/snapshots/advanced_form.en.snap)                 | [advanced_form.uk.snap](/play/snapshots/advanced_form.uk.snap)                 |
| **Toggle**               | Boolean switch (Yes/No/Так/Ні)           | [toggle.en.snap](/play/snapshots/toggle.en.snap)                               | [toggle.uk.snap](/play/snapshots/toggle.uk.snap)                               |
| **Slider**               | Range selection with visual scale        | [slider.en.snap](/play/snapshots/slider.en.snap)                               | [slider.uk.snap](/play/snapshots/slider.uk.snap)                               |
| **UI Message**           | Schema-driven automated form             | [ui_message.en.snap](/play/snapshots/ui_message.en.snap)                       | [ui_message.uk.snap](/play/snapshots/ui_message.uk.snap)                       |
| **Date & Time**          | Calendar and clock pickers               | [datetime.en.snap](/play/snapshots/datetime.en.snap)                           | [datetime.uk.snap](/play/snapshots/datetime.uk.snap)                           |
| **Sortable**             | Drag-and-drop list reordering            | [sortable.en.snap](/play/snapshots/sortable.en.snap)                           | [sortable.uk.snap](/play/snapshots/sortable.uk.snap)                           |
| **Object Map**           | Interactive property-integrated editor   | [object_form.en.snap](/play/snapshots/object_form.en.snap)                     | [object_form.uk.snap](/play/snapshots/object_form.uk.snap)                     |
| **Object Map (Complex)** | Map with Select and inferred types       | [object_form_complex.en.snap](/play/snapshots/object_form_complex.en.snap)     | [object_form_complex.uk.snap](/play/snapshots/object_form_complex.uk.snap)     |

## 🔍 Visual Reference (Interactive Tree Search)

The following slide demonstrates the Tab-based search functionality across different locales.

````carousel
```text
(Snapshot: tree_search.en.snap)
? Select a file: › package.json
You selected: package.json
```
<!-- slide -->
```text
(Snapshot: tree_search.uk.snap)
? Оберіть файл: › package.json
Ви обрали: package.json
```
````

## 🛠️ Verification Command

To update these snapshots upon UI changes, run:

```bash
UPDATE_SNAPSHOTS=1 npm run test:snapshot
```

in the `packages/ui-cli` directory.

---

> [!IMPORTANT]
> All changes to the CLI core must be validated against these snapshots before committing. Any deviation in spacing, icons, or color styling must be intentional and documented.
