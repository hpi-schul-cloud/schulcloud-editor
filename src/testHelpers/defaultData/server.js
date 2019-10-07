module.exports = {
	users: [
		{
			_id: '0000d213816abba584714c0a',
			firstName: 'user',
			lastName: 'A',
			roles: [
				{
					_id: '0000d186816abba584714c95',
					name: 'teacher',
				},
			],
			tag: 'teacher in course',
		},
		{
			_id: '0000d213816abba584714c0b',
			firstName: 'user',
			lastName: 'B',
			roles: [
				{
					_id: '0000d186816abba584714c96',
					name: 'student',
				},
			],
			tag: 'student in course',
		},
		{
			_id: '0000d213816abba584714c0c',
			firstName: 'user',
			lastName: 'C',
			roles: [
				{
					_id: '0000d186816abba584714c96',
					name: 'student',
				},
			],
			tag: 'student in course',
		},
		{
			_id: '0000d213816abba584714c0d',
			firstName: 'user',
			lastName: 'D',
			roles: [
				{
					_id: '0000d186816abba584714c97',
					name: 'teacher',
				},
			],
			tag: 'subsitution teacher in course',
		},
		{
			_id: '0000d213816abba584714c0e',
			firstName: 'user',
			lastName: 'E',
			roles: [
				{
					_id: '0000d186816abba584714c96',
					name: 'student',
				},
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
};
