---
name: frontend-skill
description: Build user interfaces for web apps. Covers pages, components, layout, and styling.
---

# Frontend Skill

## Instructions

### 1. Pages
- Create app pages
- Set page routing
- Manage page level state
- Handle loading and error states

### 2. Components
- Build reusable components
- Pass data using props
- Manage local state
- Keep components small and focused

### 3. Layout
- Use grid or flexbox
- Create responsive layouts
- Maintain consistent spacing
- Reuse layout wrappers

### 4. Styling
- Apply CSS or utility classes
- Follow design system rules
- Use responsive styles
- Keep styles readable

## Best Practices
- Build mobile first
- Reuse components
- Keep UI consistent
- Avoid inline logic in markup

## Example Structure

```jsx
function Card({ title, description }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

export default function Page() {
  return (
    <main className="layout">
      <Card title="Title" description="Text" />
    </main>
  )
}
