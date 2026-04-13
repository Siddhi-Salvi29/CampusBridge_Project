# Requirements Document

## Introduction

This feature adds a row of quick-click branch filter chips to the Network page of CampusBridge. Users can currently filter by branch only through a collapsible text-input panel. The new chips provide one-click filtering by common engineering branches (CS, IT, Mechanical, Civil, Electronics, etc.) that are always visible above the user grid, similar to how the existing role tabs work. The chips work alongside the existing text filter and role tabs — they are additive, not replacements.

## Glossary

- **Network_Page**: The React component (`Network.jsx`) that displays discoverable students and alumni.
- **Branch_Chip**: A clickable pill/button representing a single branch (e.g. "CS", "Mech").
- **Active_Chip**: The Branch_Chip that is currently selected and driving the branch filter.
- **Branch_Filter**: The filter applied to the `/api/network/users` API call via the `branch` query parameter.
- **Filter_Panel**: The existing collapsible panel containing text inputs for skills, company, and branch.
- **Role_Tab**: The existing "All People / Students / Alumni" quick-select buttons in the hero banner.
- **Branch_Text_Input**: The existing text input inside the Filter_Panel for typing a branch name.

---

## Requirements

### Requirement 1: Display Branch Filter Chips

**User Story:** As a user browsing the Network page, I want to see branch filter chips always visible on the page, so that I can filter by branch with a single click without opening the filter panel.

#### Acceptance Criteria

1. THE Network_Page SHALL display a horizontal row of Branch_Chips below the Role_Tabs and above the user grid.
2. THE Network_Page SHALL include Branch_Chips for the following branches: All, CS, IT, Mechanical, Civil, Electronics.
3. WHILE no Branch_Chip is Active, THE Network_Page SHALL display the "All" chip in its active visual state.
4. THE Network_Page SHALL render the Branch_Chip row on all viewport widths, wrapping chips to a new line when horizontal space is insufficient.

---

### Requirement 2: Branch Chip Selection and Filtering

**User Story:** As a user, I want clicking a branch chip to immediately filter the user list to that branch, so that I can quickly find people from a specific department.

#### Acceptance Criteria

1. WHEN a user clicks a Branch_Chip, THE Network_Page SHALL set that chip as the Active_Chip and trigger a new API request with the corresponding `branch` query parameter.
2. WHEN the "All" Branch_Chip is clicked, THE Network_Page SHALL clear the branch filter and fetch users without a `branch` query parameter.
3. WHEN a Branch_Chip is Active, THE Network_Page SHALL render it with a visually distinct style (e.g. filled background) to indicate selection.
4. WHEN a Branch_Chip is Active, THE Network_Page SHALL render all other Branch_Chips in their inactive style.

---

### Requirement 3: Coexistence with Existing Filters

**User Story:** As a user, I want the branch chips to work together with the role tabs and text-based filters, so that I can combine filters for more precise results.

#### Acceptance Criteria

1. WHEN a Branch_Chip is Active and the user selects a Role_Tab, THE Network_Page SHALL apply both the branch filter and the role filter simultaneously in the API request.
2. WHEN a Branch_Chip is Active and the user types in the search input, THE Network_Page SHALL apply both the branch filter and the search term simultaneously in the API request.
3. WHEN a Branch_Chip is Active and the user also types a value in the Branch_Text_Input inside the Filter_Panel, THE Network_Page SHALL use the Branch_Text_Input value as the branch filter, overriding the Active_Chip value.
4. WHEN the user clears the Branch_Text_Input while a Branch_Chip was previously Active, THE Network_Page SHALL restore the Active_Chip's branch value as the branch filter.

---

### Requirement 4: Chip State Synchronisation with Filter Panel

**User Story:** As a user, I want the branch chip selection to stay consistent with the filter panel state, so that I'm never confused about which branch filter is active.

#### Acceptance Criteria

1. WHEN the user clicks "Clear all filters" in the Filter_Panel, THE Network_Page SHALL reset the Active_Chip to "All".
2. WHEN the user types a branch value in the Branch_Text_Input that exactly matches a Branch_Chip label, THE Network_Page SHALL highlight that Branch_Chip as Active.
3. WHEN the user types a branch value in the Branch_Text_Input that does not match any Branch_Chip label, THE Network_Page SHALL display all Branch_Chips in their inactive style.

---

### Requirement 5: Loading and Empty States

**User Story:** As a user, I want clear feedback while results are loading or when no results match the selected branch, so that I understand the current state of the page.

#### Acceptance Criteria

1. WHEN a Branch_Chip is clicked and the API request is in progress, THE Network_Page SHALL display the existing loading skeleton.
2. WHEN a Branch_Chip is Active and no users match the branch filter, THE Network_Page SHALL display the existing empty-state message.
3. IF the API request fails after a Branch_Chip is clicked, THEN THE Network_Page SHALL display an error message and retain the Active_Chip selection.
