# Requirements Checklist: 009 Admin Users & Ditto Thing Provisioning

**Purpose**: Gate readiness before `/speckit-implement`.

## Specification

- [x] User stories cover identity, user admin, Thing CRUD, observability  
- [x] FR-001–FR-007 addressed in plan or explicitly deferred  
- [x] Out of scope documented and agreed  

## Security

- [x] No browser → Ditto requirement verified in contracts  
- [x] RBAC matrix reviewed for elevator CRUD and user admin  
- [x] Audit required for mutations  
- [x] Secrets / password storage approach decided in research  

## Contracts

- [x] `auth-rbac.md` claim shape frozen  
- [x] `ditto-thing-crud-api.md` paths and error codes aligned with existing API style  
- [x] Archive vs delete decision recorded  

## Testing

- [x] Contract tests planned for 401/403 matrix  
- [x] Integration test: create Thing → visible in bootstrap  
- [x] No production reliance on `/dev/ditto/seed`  

## Handoff

- [x] Run `/speckit-tasks` to generate `tasks.md`  
- [x] Link feature directory in `.specify/feature.json` when starting implementation  
