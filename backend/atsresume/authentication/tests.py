import unittest
from .views import AdminRegisterView

class TestAdminRegistration(unittest.TestCase):
    def setUp(self):
        self.view = AdminRegisterView()

    def test_register_admin_creates_admin_with_role_admin(self):
        request_data = {
            'first_name': 'Alice',
            'last_name': 'Smith',
            'email': 'alice@example.com',
            'password': 'password123'
        }

        response = self.view.register_admin_logic(request_data)

        self.assertEqual(response['first_name'], 'Alice')
        self.assertEqual(response['last_name'], 'Smith')
        self.assertEqual(response['email'], 'alice@example.com')
        self.assertEqual(response['role'], 'admin')

if __name__ == '__main__':
    unittest.main()
