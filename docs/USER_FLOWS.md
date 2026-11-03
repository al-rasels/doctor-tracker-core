# User Flows & Interaction State Diagrams
## Project: Doctor Tracker Portal

| Document Version | 1.0.0 |
| :--- | :--- |
| **System** | Doctor Tracker Web Portal |
| **Target Roles** | Healthcare Administrator, Desk Coordinator |

---

## 1. Authentication & Session Management Flow

This flow illustrates the user authentication lifecycle, token retention, automated route protection, and session revocation.

```mermaid
flowchart TD
    Start([User visits Portal]) --> CheckAuth{Has valid JWT token?}
    CheckAuth -- Yes --> GoDashboard[Redirect to Admin Dashboard]
    CheckAuth -- No --> ShowLogin[Display Login Page]

    ShowLogin --> SubmitCreds[User Enters Email & Password]
    SubmitCreds --> ValidateForm{Client Form Valid?}
    ValidateForm -- No --> ShowClientErr[Display Field Validation Errors]
    ValidateForm -- Yes --> DispatchLogin[POST /api/auth/login]

    DispatchLogin --> VerifyAuth{Server Credentials Valid?}
    VerifyAuth -- No (401) --> ShowServerErr[Display 'Invalid Email or Password']
    VerifyAuth -- Yes (200) --> StoreToken[Store JWT Token in Secure Storage]
    StoreToken --> InitSession[Initialize Auth Context / Profile]
    InitSession --> GoDashboard

    subgraph RouteProtection["In-Session Route Protection"]
        Req[User navigates to Doctors/Patients/Analytics] --> VerifyTokenExpiry{Token Expired?}
        VerifyTokenExpiry -- Yes --> ClearToken[Clear Token & State]
        ClearToken --> RedirectLogin[Redirect to Login with Toast: Session Expired]
        VerifyTokenExpiry -- No --> RenderView[Render Protected Page]
    end

    subgraph LogoutFlow["User Logout"]
        ClickLogout[User clicks 'Sign Out'] --> CallLogout[POST /api/auth/logout]
        CallLogout --> WipeStorage[Wipe Token & Query Cache]
        WipeStorage --> ShowLogin
    end
```

---

## 2. Doctor Management User Flow

Covers creating a doctor, searching/filtering the directory, viewing doctor profile details, and viewing associated patients.

```mermaid
flowchart TD
    NavDoctors[Navigate to Doctors Directory] --> FetchDoctors[GET /api/doctors with page=1]
    FetchDoctors --> DisplayCatalog[Render Doctors Grid/Table]

    subgraph SearchAndFilter["Search & Filter Interactions"]
        DisplayCatalog --> InputSearch[Type in Search Bar: 'Cardio']
        InputSearch --> Debounce[Debounce 300ms]
        Debounce --> TriggerSearch[GET /api/doctors?search=Cardio]
        TriggerSearch --> UpdateTable[Update Doctors Table]

        DisplayCatalog --> SelectSpec[Select Specialty / Date Filter]
        SelectSpec --> TriggerFilter[GET /api/doctors?specialization=...&startDate=...]
        TriggerFilter --> UpdateTable
    end

    subgraph CreateDoctor["Create New Doctor"]
        DisplayCatalog --> ClickAddDoc[Click '+ Add Doctor' Button]
        ClickAddDoc --> OpenDocModal[Open Create Doctor Modal]
        OpenDocModal --> FillDocForm[Input Name, Specialization, Hospital, Phone, Email]
        FillDocForm --> SubmitDoc[Click 'Save Doctor']
        SubmitDoc --> PostDoc[POST /api/doctors]
        PostDoc --> DocSuccess{Created Successfully?}
        DocSuccess -- No (400/409) --> ShowDocErr[Display Error Notification / Duplicate Email]
        DocSuccess -- Yes (201) --> CloseDocModal[Close Modal & Show Success Toast]
        CloseDocModal --> RefreshDoctors[Invalidate Query Cache & Refresh List]
    end

    subgraph ViewDetailsAndPatients["View Doctor & Assigned Patients"]
        DisplayCatalog --> ClickRow[Click on Doctor Card/Row]
        ClickRow --> OpenDrawer[Open Doctor Detail View / Drawer]
        OpenDrawer --> FetchAssigned[GET /api/doctors/:id/patients]
        FetchAssigned --> ShowPatientsTab[Render Assigned Patients List]
        
        ShowPatientsTab --> ClickAddPatient[Click '+ Assign New Patient']
        ClickAddPatient --> OpenAddPatientModal[Open Patient Enrollment Form (Doctor Pre-selected)]
        OpenAddPatientModal --> SubmitAssignedPatient[POST /api/doctors/:id/patients]
        SubmitAssignedPatient --> RefreshAssigned[Update Doctor's Patient Count & List]

        ShowPatientsTab --> ClickRemovePatient[Click 'Remove' on Patient]
        ClickRemovePatient --> ConfirmModal[Show Confirmation Prompt]
        ConfirmModal --> ConfirmYes[DELETE /api/doctors/:id/patients/:patientId]
        ConfirmYes --> RefreshAssigned
    end
```

---

## 3. Dedicated Patient Management User Flow

Covers the central Patient Registry, advanced filtering (date, condition, status), pagination, and patient editing/deletion.

```mermaid
flowchart TD
    NavPatients[Navigate to Patients Page] --> FetchPatients[GET /api/patients?page=1&limit=10]
    FetchPatients --> DisplayPatientTable[Render Patients Table with Status Badges]

    subgraph AdvancedFiltering["Multi-Dimensional Filter Flow"]
        DisplayPatientTable --> FilterActions[User applies filters: Date Range, Condition, Status]
        FilterActions --> BuildQuery[Construct URL Query: ?status=admitted&condition=Cardiac&page=1]
        BuildQuery --> QueryFetch[GET /api/patients with query params]
        QueryFetch --> RenderFiltered[Render Filtered Results + Update Pagination Controls]
    end

    subgraph PaginationFlow["Pagination Interaction"]
        DisplayPatientTable --> ClickPage[User clicks 'Page 2' or 'Next']
        ClickPage --> FetchNextPage[GET /api/patients?page=2]
        FetchNextPage --> SmoothScroll[Smooth scroll to top of table & render page 2]
    end

    subgraph EditPatient["Edit Patient Workflow"]
        DisplayPatientTable --> ClickEdit[Click 'Edit' Action on Patient Row]
        ClickEdit --> OpenEditModal[Open Edit Patient Modal pre-filled with data]
        OpenEditModal --> ModifyFields[Update Condition, Status, Phone, or Assigned Doctor]
        ModifyFields --> SubmitEdit[PUT /api/patients/:id]
        SubmitEdit --> EditSuccess{Saved Successfully?}
        EditSuccess -- No --> ShowEditError[Display Validation Error]
        EditSuccess -- Yes --> CloseEditModal[Close Modal & Show Toast]
        CloseEditModal --> InvalidatePatients[Refresh Patient Cache]
    end

    subgraph DeletePatient["Delete Patient Workflow"]
        DisplayPatientTable --> ClickDelete[Click 'Delete' Action]
        ClickDelete --> ShowDeleteDialog[Open Dangerous Action Confirmation Dialog]
        ShowDeleteDialog --> ClickCancel[User Clicks Cancel] --> DismissDialog[Dismiss Modal]
        ShowDeleteDialog --> ClickConfirm[User Clicks Confirm Delete]
        ClickConfirm --> CallDeleteAPI[DELETE /api/patients/:id]
        CallDeleteAPI --> ShowDeleteToast[Show 'Patient record deleted']
        ShowDeleteToast --> InvalidatePatients
    end
```

---

## 4. Analytics & Dashboard User Flow

Covers the executive dashboard, KPI cards, visual charts, and filtering timeframes.

```mermaid
flowchart TD
    NavDash[User lands on Dashboard] --> FetchAnalytics[GET /api/analytics/dashboard]
    FetchAnalytics --> ShowSkeleton[Render KPI & Chart Skeletons]
    ShowSkeleton --> ReceiveData[Receive Aggregated Analytical Payload]
    ReceiveData --> RenderKPIs[Render KPI Metric Cards: Total Doctors, Total Patients, Avg Load]
    ReceiveData --> RenderCharts[Render Recharts Visualizations]

    subgraph ChartInteractions["Dashboard Interactive Controls"]
        RenderCharts --> BarChart[Patients per Doctor Bar Chart]
        BarChart --> HoverBar[Hover over bar: Tooltip displays Doctor details & exact count]

        RenderCharts --> AreaChart[Admission Trends Over Time Line/Area Chart]
        AreaChart --> RangePicker[User selects Timeframe: 7 Days / 30 Days / All Time]
        RangePicker --> RequeryTimeline[GET /api/analytics/dashboard?timeframe=30d]
        RequeryTimeline --> UpdateTimeline[Smoothly animate chart update]

        RenderCharts --> DonutChart[Patient Condition Distribution Donut Chart]
        DonutChart --> ClickSlice[Click category slice to filter view]
    end
```

---

## 5. Edge Cases & Error Recovery Flows

| Scenario | System Behavior | User Feedback |
| :--- | :--- | :--- |
| **Network Disconnection** | API client catches timeout/failure | Toast: *"Unable to reach server. Please check your internet connection."* Action: Retry button. |
| **Token Expiration (401)** | Interceptor detects expired token | Clears session, redirects to `/login?session_expired=true` with toast notification. |
| **Duplicate Doctor Email (409)** | API returns `409 Conflict` | Inline form field highlight under Email: *"A doctor with this email is already registered."* |
| **Deleting Doctor with Active Patients** | System checks patient count | Modal warning: *"This doctor has active patients. Transfer or reassign patients before deletion."* |
| **Zero Search Results** | Table data array is empty `[]` | Illustrated empty state: *"No matching records found. Try clearing your filters."* + Reset Button. |
