package authz

const (
	PermCourseRead  = "course:read"
	PermCourseWrite = "course:write"

	PermAIUse  = "ai:use"
	PermSimUse = "sim:use"
)

var rolePermissions = map[string]map[string]bool{
	"admin": {
		"*": true,
	},
	"teacher": {
		PermCourseRead:  true,
		PermCourseWrite: true,
		PermAIUse:       true,
		PermSimUse:      true,
	},
	"assistant": {
		PermCourseRead: true,
		PermAIUse:      true,
		PermSimUse:     true,
	},
	"student": {
		PermCourseRead: true,
		PermAIUse:      true,
		PermSimUse:     true,
	},
}

func HasPermission(role string, perm string) bool {
	perms, ok := rolePermissions[role]
	if !ok {
		return false
	}
	if perms["*"] {
		return true
	}
	return perms[perm]
}
