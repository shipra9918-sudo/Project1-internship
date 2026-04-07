import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateRestaurant = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    cuisineType: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      phone: form.phone,
      cuisineType: [form.cuisineType], // must be array
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
      },
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716] // dummy for now
      }
    };

    try {
      await api.post('/restaurants', payload); // 🔥 sends to backend
      alert("Restaurant Created!");
      navigate('/merchant/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Phone" onChange={e => setForm({...form, phone: e.target.value})} />
      <input placeholder="Cuisine" onChange={e => setForm({...form, cuisineType: e.target.value})} />
      <input placeholder="Street" onChange={e => setForm({...form, street: e.target.value})} />
      <input placeholder="City" onChange={e => setForm({...form, city: e.target.value})} />
      <input placeholder="State" onChange={e => setForm({...form, state: e.target.value})} />
      <input placeholder="Zip" onChange={e => setForm({...form, zipCode: e.target.value})} />

      <button type="submit">Create</button>
    </form>
  );
};

export default CreateRestaurant;