# 📋 **Event API Endpoints - Complete Documentation**

## **Base URL**: `/api/v1/events`

---

## **🔍 Standard CRUD Operations**

### **1. List Events**

- **URL**: `GET /api/v1/events`
- **Permission**: `HasEventPermission` (public for published events)
- **Query Parameters**:
  - **Filtering**: `status`, `venue`, `organizer`, `short_url`, `featured`, `featured_until`, `category`, `event_type`, `format`, `is_recurring`, `is_series`, `age_restriction`, `minimum_age`, `maximum_age`, `start_date`, `end_date`
  - **Search**: `search` (searches in: `title`, `description`, `venue`, `short_url`, `series_name`, `category__name`, `event_type__name`, `format__name`)
  - **Ordering**: `ordering` (fields: `start_date`, `end_date`, `created_at`)
  - **Pagination**: `page`, `page_size`
- **Response**: `ListResponse` with paginated event data

### **2. Create Event**

- **URL**: `POST /api/v1/events`
- **Permission**: `HasEventPermission` (authenticated users)
- **Request Body**: EventSerializer fields (see below)
- **Response**: `CreateResponse` with created event data

### **3. Retrieve Event**

- **URL**: `GET /api/v1/events/{id_or_short_url}`
- **Permission**: `HasEventPermission` (public for published events)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `RetrieveResponse` with event data

### **4. Update Event**

- **URL**: `PATCH /api/v1/events/{id_or_short_url}`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Request Body**: Partial EventSerializer fields
- **Response**: `UpdateResponse` with updated event data

### **5. Delete Event**

- **URL**: `DELETE /api/v1/events/{id_or_short_url}`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `DeleteResponse` with success message

---

## **🏗️ Event Management Actions**

### **6. Publish Event**

- **URL**: `POST /api/v1/events/{id_or_short_url}/publish`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `SuccessResponse` with updated event data

### **7. Unpublish Event**

- **URL**: `POST /api/v1/events/{id_or_short_url}/unpublish`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `SuccessResponse` with updated event data

### **8. Cancel Event**

- **URL**: `POST /api/v1/events/{id_or_short_url}/cancel`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `SuccessResponse` with updated event data

---

## **👥 Team Management**

### **9. Invite Team Member**

- **URL**: `POST /api/v1/events/{id_or_short_url}/invite`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Request Body**:

  ```json
  {
    "user_email": "user@example.com",
    "role": "EVENT_MANAGER"
  }
  ```

- **Response**: `CreateResponse` with team member data

### **10. Remove Team Member**

- **URL**: `POST /api/v1/events/{id_or_short_url}/remove`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Query Parameters**: `id` (team member ID)
- **Response**: `SuccessResponse` with success message

### **11. Accept Invitation**

- **URL**: `POST /api/v1/events/{id_or_short_url}/accept`
- **Permission**: `HasEventPermission` (authenticated users)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Query Parameters**: `token` (invitation token)
- **Response**: `SuccessResponse` with team member data

### **12. Accept Invitation (Public)**

- **URL**: `POST /api/v1/events/accept-invite`
- **Permission**: `AllowAny`
- **Request Body**:

  ```json
  {
    "token": "invitation_token"
  }
  ```

- **Response**: `SuccessResponse` with user data, tokens, and team member data

### **13. Resend Invitation**

- **URL**: `POST /api/v1/events/{id_or_short_url}/resend`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Query Parameters**: `id` (team member ID)
- **Response**: `SuccessResponse` with team member data

---

## **📊 Analytics & Reports**

### **14. Get Event Analytics**

- **URL**: `GET /api/v1/events/{id_or_short_url}/analytics`
- **Permission**: `IsAuthenticated` + `VIEW_EVENT_ANALYTICS` permission
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Query Parameters**:
  - `granularity` (default: "day")
  - `include_checkins` (default: "true")
- **Response**: `SuccessResponse` with analytics data

### **15. Export Analytics**

- **URL**: `POST /api/v1/events/{id_or_short_url}/analytics/export`
- **Permission**: `IsAuthenticated` + `EXPORT_REPORTS` permission
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Request Body**:

  ```json
  {
    "format": "csv",
    "granularity": "day",
    "sections": {
      "overview": true,
      "ticket_sales": true,
      "check_in": true
    },
    "columns": {}
  }
  ```

- **Response**: `SuccessResponse` with download URL and file info

### **16. Get Event Revenue**

- **URL**: `GET /api/v1/events/{id_or_short_url}/revenue`
- **Permission**: `IsAuthenticated` (event organizer only)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `SuccessResponse` with revenue data

---

## **🎭 Performers & Locations**

### **17. Get Event Performers**

- **URL**: `GET /api/v1/events/{id_or_short_url}/performers`
- **Permission**: `HasEventPermission` (public for published events)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `ListResponse` with performers data

### **18. Get Performer Detail**

- **URL**: `GET /api/v1/events/{id_or_short_url}/performers/{performer_id}`
- **Permission**: `HasEventPermission` (public for published events)
- **Path Parameters**:
  - `id_or_short_url` (UUID or short_url)
  - `performer_id` (UUID)
- **Response**: `RetrieveResponse` with performer data

### **19. List Locations**

- **URL**: `GET /api/v1/events/locations`
- **Permission**: `HasEventPermission` (public)
- **Query Parameters**:
  - `name` (filter by name)
  - `city` (filter by city)
  - `country` (filter by country)
- **Response**: `ListResponse` with locations data

### **20. Get Location Detail**

- **URL**: `GET /api/v1/events/locations/{id}`
- **Permission**: `HasEventPermission` (public)
- **Path Parameters**: `id` (UUID)
- **Response**: `RetrieveResponse` with location data

---

## **⭐ Special Event Lists**

### **21. Get Featured Events**

- **URL**: `GET /api/v1/events/featured`
- **Permission**: `HasEventPermission` (public)
- **Query Parameters**: Standard filtering and pagination
- **Response**: `ListResponse` with featured events

### **22. Get My Events**

- **URL**: `GET /api/v1/events/my_events`
- **Permission**: `IsAuthenticated`
- **Query Parameters**:
  - `owner` (boolean, show only events where user is organizer)
  - Standard filtering and pagination
- **Response**: `ListResponse` with user's events

---

## **🏷️ Categorization Endpoints**

### **23. Get Categories**

- **URL**: `GET /api/v1/events/categories`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `parent_id` (get subcategories of specific parent)
  - `include_inactive` (default: "false")
- **Response**: `ListResponse` with categories data

### **24. Get Category Detail**

- **URL**: `GET /api/v1/events/categories/{id}`
- **Permission**: `AllowAny`
- **Path Parameters**: `id` (UUID)
- **Response**: `RetrieveResponse` with category data

### **25. Get Event Types**

- **URL**: `GET /api/v1/events/types`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `include_inactive` (default: "false")
- **Response**: `ListResponse` with event types data

### **26. Get Event Formats**

- **URL**: `GET /api/v1/events/formats`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `include_inactive` (default: "false")
- **Response**: `ListResponse` with event formats data

### **27. Get Event Tags**

- **URL**: `GET /api/v1/events/tags`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `search` (string, search tags by name - case-insensitive partial match)
  - `trending` (boolean, show only trending tags)
  - `limit` (integer, limit number of results)
- **Response**: `ListResponse` with tags data (ordered by relevance if search provided)

---

## **🏷️ Tag Management & Search**

### **Tag Search for Autocomplete**

The tags endpoint now supports real-time search functionality perfect for autocomplete features:

**Search Tags by Name:**

```
GET /api/v1/events/tags?search=music&limit=10
```

**Response with Relevance Ordering:**

```json
{
  "status": "success",
  "message": "Event tags retrieved successfully",
  "data": {
    "results": [
      {
        "id": 1,
        "name": "music",
        "slug": "music",
        "description": "Music events",
        "color": "#FF6B6B",
        "is_trending": true,
        "usage_count": 25
      },
      {
        "id": 2,
        "name": "live-music",
        "slug": "live-music", 
        "description": "Live music performances",
        "color": "#4ECDC4",
        "is_trending": false,
        "usage_count": 15
      }
    ]
  }
}
```

**Relevance Ordering:**

1. **Exact matches** (highest priority)
2. **Starts with** search term
3. **Contains** search term
4. **Usage count** (for ties)

### **Auto-Creation of Tags**

When creating or updating events, tags are automatically created if they don't exist:

**Request:**

```json
{
  "title": "New Event",
  "tags_input": ["new-tag", "existing-tag", "another-new-tag"]
}
```

**Behavior:**

- `existing-tag` → Links to existing tag
- `new-tag` → Creates new tag with slug `new-tag`
- `another-new-tag` → Creates new tag with slug `another-new-tag`

---

## **🔍 Filtered Event Lists**

### **28. Get Events by Category**

- **URL**: `GET /api/v1/events/by_category`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `category_id` OR `category_slug` (required)
  - `include_subcategories` (default: "true")
  - Standard filtering and pagination
- **Response**: `ListResponse` with filtered events

### **29. Get Events by Type**

- **URL**: `GET /api/v1/events/by_type`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `type_id` OR `type_slug` (required)
  - Standard filtering and pagination
- **Response**: `ListResponse` with filtered events

### **30. Get Events by Format**

- **URL**: `GET /api/v1/events/by_format`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `format_id` OR `format_slug` (required)
  - Standard filtering and pagination
- **Response**: `ListResponse` with filtered events

### **31. Get Events by Tag**

- **URL**: `GET /api/v1/events/by_tag`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `tag` OR `tag_id` (required)
  - Standard filtering and pagination
- **Response**: `ListResponse` with filtered events

### **32. Get Age-Restricted Events**

- **URL**: `GET /api/v1/events/age_restricted`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `min_age` (integer)
  - `max_age` (integer)
  - `age_restriction` (string)
  - Standard filtering and pagination
- **Response**: `ListResponse` with filtered events

### **33. Get Virtual Events**

- **URL**: `GET /api/v1/events/virtual_events`
- **Permission**: `AllowAny`
- **Query Parameters**:
  - `format` ("all", "virtual", "hybrid", default: "all")
  - Standard filtering and pagination
- **Response**: `ListResponse` with filtered events

---

## **📝 Media Management**

### **34. Get Event Media**

- **URL**: `GET /api/v1/events/{id_or_short_url}/media`
- **Permission**: `HasEventPermission`
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `ListResponse` with media data

### **35. Upload Media**

- **URL**: `POST /api/v1/events/{id_or_short_url}/upload_media`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Request Body**: Form data with image files
- **Response**: `SuccessResponse` with uploaded media data

### **36. Get Event Content**

- **URL**: `GET /api/v1/events/{id_or_short_url}/content`
- **Permission**: `HasEventPermission`
- **Path Parameters**: `id_or_short_url` (UUID or short_url)
- **Response**: `ListResponse` with content sections data

### **37. Set Media Featured**

- **URL**: `POST /api/v1/events/{event_id}/media/{id}/set_featured`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**:
  - `event_id` (UUID)
  - `id` (media UUID)
- **Response**: `SuccessResponse` with updated media data

### **38. Reorder Media**

- **URL**: `POST /api/v1/events/{event_id}/media/{id}/reorder`
- **Permission**: `HasEventPermission` (event organizer/admin)
- **Path Parameters**:
  - `event_id` (UUID)
  - `id` (media UUID)
- **Request Body**:

  ```json
  {
    "order": "integer"
  }
  ```

- **Response**: `SuccessResponse` with updated media data

---

## **📝 Request/Response Body Structures**

### **EventSerializer Fields (Create/Update)**

```json
{
  "title": "string (required, unique)",
  "description": "string (required, max 2000 chars)",
  "start_date": "datetime (required)",
  "end_date": "datetime (required)",
  "venue": "string (required)",
  "capacity": "integer (optional, default: 0)",
  "price": "decimal (optional, default: 0.00)",
  "cover_image": "file (optional)",
  "timezone": "string (required, timezone)",
  "featured": "boolean (optional)",
  "featured_until": "datetime (optional)",

  // Location (optional)
  "location": {
    "name": "string",
    "description": "string",
    "address": "string",
    "city": "string",
    "country": "string",
    "landmarks": "string",
    "latitude": "decimal",
    "longitude": "decimal",
    "maps_url": "string",
    "phone": "string"
  },

  // Social Media URLs (optional)
  "facebook_url": "string",
  "twitter_url": "string",
  "instagram_url": "string",
  "linkedin_url": "string",
  "website_url": "string",
  "youtube_url": "string",
  "tiktok_url": "string",
  "snapchat_url": "string",
  "discord_url": "string",
  "telegram_url": "string",

  // Categorization (optional)
  "category": "uuid (EventCategory)",
  "event_type": "uuid (EventType)",
  "format": "uuid (EventFormat)",
  "tags_input": ["string (tag names - auto-creates if not exist)"],

  // Age & Content Restrictions (optional)
  "age_restriction": "string",
  "content_rating": "string",
  "minimum_age": "integer",
  "maximum_age": "integer",

  // Event Characteristics (optional)
  "is_recurring": "boolean",
  "is_series": "boolean",
  "series_name": "string",
  "series_number": "integer",

  // Virtual/Hybrid Event Fields (optional)
  "virtual_meeting_url": "string",
  "virtual_platform": "string",
  "virtual_instructions": "string",
  "virtual_capacity": "integer",

  // Rich Content (optional)
  "agenda": "array",
  "speakers": "array",
  "sponsors": "array",
  "faq": "array",
  "highlights": "array",

  // SEO & Meta (optional)
  "meta_title": "string",
  "meta_description": "string",
  "meta_keywords": "string",
  "canonical_url": "string",
  "language": "string",
  "subtitles_available": "boolean",
  "sign_language_available": "boolean"
}
```

### **Performer Data Structure**

```json
{
  "name": "string (required)",
  "description": "string",
  "website_url": "string",
  "facebook_url": "string",
  "twitter_url": "string",
  "instagram_url": "string",
  "linkedin_url": "string",
  "spotify_url": "string",
  "apple_music_url": "string",
  "soundcloud_url": "string",
  "youtube_url": "string",
  "bandcamp_url": "string",
  "tiktok_url": "string",
  "artstation_url": "string",
  "behance_url": "string"
}
```

### **Response Structure**

```json
{
  "success": true,
  "message": "string",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "string",
    "organizer": "uuid",
    "organizer_name": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "venue": "string",
    "location": "object|null",
    "capacity": "integer",
    "price": "string",
    "cover_image": "string|null",
    "timezone": "string",
    "featured": "boolean",
    "featured_until": "datetime|null",
    "short_url": "string",
    "share_url": "string",
    "created_at": "datetime",
    "updated_at": "datetime",

    // Categorization
    "category": "object|null",
    "event_type": "object|null",
    "format": "object|null",
    "tags": "array (tag names)",
    "tags_data": "array (full tag objects)",

    // Age & Content
    "age_restriction": "string",
    "content_rating": "string",
    "minimum_age": "integer|null",
    "maximum_age": "integer|null",
    "is_age_restricted": "boolean",

    // Event Characteristics
    "is_recurring": "boolean",
    "is_series": "boolean",
    "series_name": "string",
    "series_number": "integer",

    // Virtual/Hybrid
    "virtual_meeting_url": "string",
    "virtual_platform": "string",
    "virtual_instructions": "string",
    "virtual_capacity": "integer",

    // Social Media
    "facebook_url": "string",
    "twitter_url": "string",
    "instagram_url": "string",
    "linkedin_url": "string",
    "website_url": "string",
    "youtube_url": "string",
    "tiktok_url": "string",
    "snapchat_url": "string",
    "discord_url": "string",
    "telegram_url": "string",

    // SEO & Meta
    "meta_title": "string",
    "meta_description": "string",
    "meta_keywords": "string",
    "canonical_url": "string",
    "language": "string",
    "subtitles_available": "boolean",
    "sign_language_available": "boolean",

    // Computed Fields
    "category_path": "string|null",
    "format_display": "string",
    "tag_names": "array",
    "similar_events": "array",

    // Tickets
    "available_tickets": "array",
    "other_tickets": "array",

    // Team Members
    "team_members": "array",

    // Performers
    "performers": "array"
  }
}
```

### **Error Response Structure**

```json
{
  "success": false,
  "message": "string",
  "errors": {
    "field_name": ["error_message"]
  }
}
```

### **Common Validation Errors**

**Single Field Error:**

```json
{
  "title": ["This field is required."]
}
```

**Multiple Field Errors:**

```json
{
  "title": ["This field is required."],
  "start_date": ["Datetime has wrong format. Use one of these formats instead: YYYY-MM-DDThh:mm[:ss[.uuuuuu]][+HH:MM|-HH:MM|Z]."],
  "capacity": ["Ensure this value is greater than or equal to 0."],
  "category": ["Invalid pk \"invalid-uuid\" - object does not exist."]
}
```

**Custom Validation Errors:**

```json
{
  "title": ["An event with this title already exists. Please choose a different title."],
  "category": ["The selected category is not active."],
  "event_type": ["The selected event type is not active."],
  "format": ["The selected format is not active."]
}
```

---

## **🔐 Permission Levels**

- **`AllowAny`**: Public access
- **`IsAuthenticated`**: Requires authentication
- **`HasEventPermission`**: Role-based permissions (organizer, admin, etc.)
- **Custom Permissions**: `VIEW_EVENT_ANALYTICS`, `EXPORT_REPORTS`

---

## **📊 Search & Filtering**

### **Search Fields**

- `title`, `description`, `venue`, `short_url`, `series_name`
- `category__name`, `event_type__name`, `format__name`

### **Filter Fields**

- `status`, `venue`, `organizer`, `short_url`, `featured`, `featured_until`
- `category`, `event_type`, `format`, `is_recurring`, `is_series`
- `age_restriction`, `minimum_age`, `maximum_age`, `start_date`, `end_date`

### **Ordering Fields**

- `start_date`, `end_date`, `created_at`

---

## **📋 Query Parameters Examples**

### **List with Filtering**

```
GET /api/v1/events?status=PUBLISHED&category=music&start_date__gte=2025-01-01&featured=true&ordering=start_date
```

### **Search Events**

```
GET /api/v1/events?search=concert&page=1&page_size=20
```

### **Get Events by Category**

```
GET /api/v1/events/by_category?category_slug=music&include_subcategories=true
```

### **Get Virtual Events**

```
GET /api/v1/events/virtual_events?format=virtual&status=PUBLISHED
```

---

## **📝 Request Examples**

### **Create Event**

```json
POST /api/v1/events
Content-Type: application/json

{
  "title": "Tech Conference 2025",
  "description": "Annual technology conference featuring latest innovations",
  "start_date": "2025-06-15T10:00:00Z",
  "end_date": "2025-06-15T18:00:00Z",
  "venue": "Conference Center",
  "capacity": 500,
  "price": "50.00",
  "timezone": "America/New_York",
  "category": "124cd01e-9dc6-4328-97e5-51fa21946d2a",
  "format": "ac9010e0-8a12-4f7d-a65a-4681ce94ade0",
  "tags_input": ["technology", "innovation", "networking"],
  "age_restriction": "18+",
  "facebook_url": "https://facebook.com/event",
  "twitter_url": "https://twitter.com/event",
  "website_url": "https://eventwebsite.com"
}
```

### **Update Event**

```json
PATCH /api/v1/events/2d453ba8-da8d-45b8-8106-d60b271516dd
Content-Type: application/json

{
  "title": "Updated Event Title",
  "price": "75.00",
  "featured": true,
  "featured_until": "2025-12-31T23:59:59Z"
}
```

### **Invite Team Member**

```json
POST /api/v1/events/2d453ba8-da8d-45b8-8106-d60b271516dd/invite
Content-Type: application/json

{
  "user_email": "teammember@example.com",
  "role": "EVENT_TEAM"
}
```

---

## **🎯 Key Features**

✅ **38 comprehensive endpoints** covering all event management needs
✅ **Role-based permissions** with granular access control
✅ **Advanced filtering and search** capabilities
✅ **Rich media and content management**
✅ **Analytics and reporting** with export functionality
✅ **Team collaboration** features
✅ **Social media integration**
✅ **SEO optimization** fields
✅ **Virtual/hybrid event support**
✅ **Multi-timezone support**
✅ **Age and content restrictions**
✅ **Event categorization** with hierarchical categories
✅ **Smart tag management** with auto-creation and search
✅ **Tag search with relevance ordering** for autocomplete
✅ **Similar events recommendation**
✅ **Flash sale integration**
✅ **Performance optimized** with caching and indexing
✅ **Robust error handling** with detailed validation messages

## **🔄 Recent Improvements**

### **Tags System Overhaul (Latest Update)**

**Fixed Issues:**

- ✅ **Resolved serialization error**: Fixed `'_TaggableManager' object is not iterable` error
- ✅ **Improved tag handling**: Separated read and write operations for better performance
- ✅ **Enhanced validation**: Added comprehensive validation for categories, event types, and formats

**New Features:**

- ✅ **Auto-creation of tags**: Tags are automatically created when provided in requests
- ✅ **Tag search with relevance**: Smart search ordering (exact → starts with → contains)
- ✅ **Dual tag representation**: Both simple names and full objects in responses
- ✅ **Better error messages**: Detailed validation errors for all categorization fields

**API Changes:**

- **Request**: Use `tags_input` field with array of tag names (strings)
- **Response**: Get both `tags` (names) and `tags_data` (full objects)
- **Search**: Enhanced `/api/v1/events/tags/` endpoint with `search` parameter

---

This comprehensive API documentation covers all 38 endpoints in the EventViewSet with their complete parameter specifications, request/response structures, and permission requirements.
