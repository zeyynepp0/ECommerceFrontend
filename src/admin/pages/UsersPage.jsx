import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../../utils/api';
// Açıklama: Admin panelinde kullanıcıları listeleyen ve yönetim işlemleri yapan sayfa.
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    apiGet('https://localhost:7098/api/Admin/users')
      .then(setUsers)
      .catch(() => setError('Kullanıcılar yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);
  const handleDelete = async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/User/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch {
      setError('Kullanıcı silinemedi.');
    }
  };
  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="admin-users-page">
      <h2>Kullanıcılar</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ad Soyad</th>
            <th>Email</th>
            <th>Rol</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleDelete(user.id)}>Sil</button>
                {/* Rol değiştirme, detay görme gibi işlemler eklenebilir */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default UsersPage;
