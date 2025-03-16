# tests/test_admin_registration.py

class AdminRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_admin_success(self):
        request_data = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.client.post('/api/admin/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['first_name'], 'Alice')
        self.assertEqual(response.data['last_name'], 'Smith')
        self.assertEqual(response.data['email'], 'alice@example.com')
        self.assertEqual(response.data['role'], 'admin')

    def test_register_admin_missing_fields(self):
        request_data = {
            'first_name': 'Alice',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.client.post('/api/admin/register/', request_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('last_name', response.data)

