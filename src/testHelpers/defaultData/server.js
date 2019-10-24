module.exports = {
	users: [
		{
			_id: '0000d213816abba584714c0a',
			firstName: 'user',
			lastName: 'A',
			roles: [
				'0000d186816abba584714c97',
			],
			tag: 'teacher in course',
		},
		{
			_id: '0000d213816abba584714c0b',
			firstName: 'user',
			lastName: 'B',
			roles: [
				'0000d186816abba584714c96',
			],
			tag: 'student in course',
		},
		{
			_id: '0000d213816abba584714c0c',
			firstName: 'user',
			lastName: 'C',
			roles: [
				'0000d186816abba584714c96',
			],
			tag: 'student in course',
		},
		{
			_id: '0000d213816abba584714c0d',
			firstName: 'user',
			lastName: 'D',
			roles: [
				'0000d186816abba584714c97',
			],
			tag: 'subsitution teacher in course',
		},
		{
			_id: '0000d213816abba584714c0e',
			firstName: 'user',
			lastName: 'E',
			roles: [
				'0000d186816abba584714c96',
			],
			tag: 'student not in course',
		},
	],
	courses: [
		{
			_id: '59a3c657a2049554a93fec3a',
			name: 'Course A',
			teachersIds: [
				'0000d213816abba584714c0a',
			],
			userIds: [
				'0000d213816abba584714c0b', '0000d213816abba584714c0c',
			],
			substitutionIds: [

			],
			tag: 'course without substitution teacher',
		},
		{
			_id: '59a3c657a2049554a93fec3b',
			name: 'Course B',
			teachersIds: [
				'0000d213816abba584714c0a',
			],
			userIds: [
				'0000d213816abba584714c0b', '0000d213816abba584714c0c',
			],
			substitutionIds: [
				'0000d213816abba584714c0d',
			],
			tag: 'course with substitution teacher',
		},
	],
	roles: [
		{
			_id: '0000d186816abba584714c96',
			name: 'student',
			permissions: [
				'FOLDER_DELETE',
				'FOLDER_CREATE',
				'FILE_DELETE',
				'FILE_CREATE',
				'FILE_MOVE',
				'CALENDAR_VIEW',
				'CALENDAR_EDIT',
				'CALENDAR_CREATE',
				'TOPIC_VIEW',
				'LINK_CREATE',
				'HOMEWORK_VIEW',
			],
		},
		{
			_id: '0000d186816abba584714c97',
			name: 'teacher',
			permissions: [
				'FOLDER_DELETE',
				'FOLDER_CREATE',
				'FILE_DELETE',
				'FILE_CREATE',
				'FILE_MOVE',
				'CALENDAR_VIEW',
				'CALENDAR_EDIT',
				'CALENDAR_CREATE',
				'TOPIC_VIEW',
				'HOMEWORK_VIEW',
				'COURSE_EDIT',
				'HOMEWORK_EDIT',
				'HOMEWORK_CREATE',
				'LESSONS_VIEW',
				'TOPIC_CREATE',
				'TOPIC_EDIT',
				'USER_CREATE',
				'LESSONS_CREATE',
			],
		},
	],
};
