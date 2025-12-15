# Party API Integration Summary

## Overview
Successfully integrated Party API endpoints into the frontend application, replacing mock data with real API calls.

## Files Modified

### 1. src/stores/partyStore.ts
**Status**: ✅ Complete

**Changes**:
- Imported `partyApi` from API client
- Updated store interface with API-aligned methods
- Replaced all mock implementations with real API calls

**New Methods**:
- `fetchParties()` - Get all parties with pagination
- `fetchBySchedule()` - Get parties by schedule with filters
- `fetchPartyMembers()` - Get confirmed party members
- `fetchPartyApplicants()` - Get party applicants (host only)
- `createParty()` - Create new party with API spec fields
- `updateParty()` - Update existing party
- `deleteParty()` - Delete party (host only)
- `applyToParty()` - Apply to join party
- `acceptApplicant()` - Accept application (host only)
- `rejectApplicant()` - Reject application (host only)
- `cancelApplication()` - Cancel own application
- `getMyCreated()` - Get parties created by user
- `getMyApplications()` - Get user's party applications

**API Request Types**:
```typescript
CreatePartyRequest {
  scheduleId: number;
  partyType: 'LEAVE' | 'ARRIVE';
  partyName: string;
  description?: string;
  departureLocation: string;
  arrivalLocation: string;
  transportType: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
  maxMembers: number; // 2-10
  preferredGender: 'MALE' | 'FEMALE' | 'ANY';
  preferredAge: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
}
```

### 2. src/app/party/page.tsx
**Status**: ✅ Complete

**Changes**:
- Added schedule filter dropdown using `scheduleApi.getPartyList()`
- Replaced mock data with `fetchParties()` and `fetchBySchedule()`
- Integrated tab filter with API params
- Tab values: 전체 (all) | 출발 (LEAVE) | 귀가 (ARRIVE)

**Features**:
- Event selection dropdown
- Party type tabs (All/Departure/Return)
- Real-time filtering with API

### 3. src/app/party/create/page.tsx
**Status**: ✅ Complete

**Changes**:
- Replaced mock events with `scheduleApi.getPartyList()`
- Updated form fields to match API spec
- Added new fields: transportType, preferredGender, preferredAge
- Removed old fields: departureTime (not in API spec)

**Form Fields**:
- Schedule selection (from API)
- Party name
- Party type (LEAVE/ARRIVE)
- Departure/Arrival locations
- Transport type (TAXI/CARPOOL/SUBWAY/BUS/WALK)
- Max members (2-10)
- Preferred gender (MALE/FEMALE/ANY)
- Preferred age (TEEN/TWENTY/THIRTY/FORTY/FIFTY_PLUS/NONE)
- Description (optional)

### 4. src/app/party/[id]/page.tsx
**Status**: ⚠️ Needs Update

**TODO**:
- Replace mock data with API calls
- Use `fetchPartyMembers()` for member list
- Use `fetchPartyApplicants()` for applicant list (host only)
- Implement `applyToParty()` for join requests
- Implement `acceptApplicant()` / `rejectApplicant()` for host actions
- Add authorization checks (host vs member)

### 5. src/app/party/my-parties/page.tsx
**Status**: ⚠️ Needs Update

**TODO**:
- Replace tab data with `getMyCreated()` and `getMyApplications()`
- Implement status-based filtering
- Update UI to match API response structure
- Add pagination support

## API Endpoints Used

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/v1/party` | GET | Get all parties | No |
| `/api/v1/party` | POST | Create party | Yes |
| `/api/v1/party/{id}` | PUT | Update party | Yes (Host) |
| `/api/v1/party/{id}` | DELETE | Delete party | Yes (Host) |
| `/api/v1/party/schedule/{scheduleId}` | GET | Get parties by schedule | No |
| `/api/v1/party/{id}/members` | GET | Get confirmed members | No |
| `/api/v1/party/{id}/application/applicants` | GET | Get applicants | Yes (Host) |
| `/api/v1/party/{id}/application/apply` | POST | Apply to party | Yes |
| `/api/v1/party/{id}/application/{appId}/accept` | PATCH | Accept application | Yes (Host) |
| `/api/v1/party/{id}/application/{appId}/reject` | PATCH | Reject application | Yes (Host) |
| `/api/v1/party/{id}/application/{appId}/cancel` | DELETE | Cancel application | Yes |
| `/api/v1/party/user/me/party/created` | GET | Get my created parties | Yes |
| `/api/v1/party/user/me/party/application` | GET | Get my applications | Yes |
| `/api/v1/schedule/partyList` | GET | Get schedule list for party | Yes |

## Key Differences: Mock vs API

### Party Type
- **Mock**: `'departure' | 'return'`
- **API**: `'LEAVE' | 'ARRIVE'`

### Fields Removed
- `departureTime` - Not in API spec

### Fields Added
- `transportType` - Required (TAXI/CARPOOL/SUBWAY/BUS/WALK)
- `preferredGender` - Required (MALE/FEMALE/ANY)
- `preferredAge` - Required (age groups or NONE)

### ID Types
- **Mock**: string IDs
- **API**: numeric IDs

## Error Handling

All API calls include error handling:
```typescript
try {
  const response = await partyApi.method();
  // Handle success
} catch (error: any) {
  set({
    error: error?.message || 'Default error message',
    isLoading: false,
  });
  throw error;
}
```

## Pagination Support

API supports pagination via query params:
- `page` - Page number (default: 0)
- `size` - Items per page (default: 20)

Response format:
```typescript
{
  content: Party[],
  totalElements: number,
  totalPages: number,
  size: number,
  number: number
}
```

## Testing Recommendations

### Unit Tests
1. Store methods call correct API endpoints
2. Error handling works properly
3. Loading states update correctly

### Integration Tests
1. Party list loads from API
2. Schedule filter works
3. Party creation with all required fields
4. Application flow (apply → accept/reject)
5. Host-only actions require authentication

### E2E Tests (Playwright)
1. Browse parties without login
2. Create party (requires login)
3. Apply to party (requires login)
4. Host approves/rejects applications
5. Member views party details

## Next Steps

1. ✅ Update `party/[id]/page.tsx` with API integration
2. ✅ Update `party/my-parties/page.tsx` with API integration
3. ⚠️ Add type definitions for API responses
4. ⚠️ Implement pagination UI
5. ⚠️ Add loading skeletons
6. ⚠️ Write comprehensive tests
7. ⚠️ Handle edge cases (empty states, errors)

## Notes

- All authenticated endpoints require login redirect
- Host-only actions need permission checks
- API responses may need transformation for UI compatibility
- Consider adding optimistic updates for better UX
- Implement proper error messages from API responses
