import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessons, createLesson, deleteLesson, updateLesson } from '../store/lessonSlice';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { lessons, meta } = useSelector((state) => state.lesson);
  const [form, setForm] = useState({ title: '', description: '', order_index: 0, xp_reward: 0 });

  useEffect(() => {
    dispatch(fetchLessons({ page: 1, limit: 5 }));
  }, [dispatch]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createLesson(form));
    setForm({ title: '', description: '', order_index: 0, xp_reward: 0 });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel: Lessons Management</h1>

      {/* Форма создания */}
      <form onSubmit={handleCreate} className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="font-bold mb-2">Add New Lesson</h2>
        <div className="grid grid-cols-2 gap-4">
          <input className="border p-2" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <input className="border p-2" placeholder="XP Reward" type="number" value={form.xp_reward} onChange={e => setForm({...form, xp_reward: parseInt(e.target.value)})} />
          <textarea className="border p-2 col-span-2" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Create Lesson</button>
      </form>

      {/* Таблица уроков */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Order</th>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">XP</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id}>
              <td className="p-2 border">{lesson.order_index}</td>
              <td className="p-2 border">{lesson.title}</td>
              <td className="p-2 border">{lesson.xp_reward}</td>
              <td className="p-2 border">
                <button onClick={() => dispatch(deleteLesson(lesson.id))} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Пагинация */}
      <div className="mt-4 flex gap-4 items-center">
        <button disabled={meta.currentPage === 1} onClick={() => dispatch(fetchLessons({ page: meta.currentPage - 1, limit: 5 }))}>Prev</button>
        <span>Page {meta.currentPage} of {meta.totalPages}</span>
        <button disabled={meta.currentPage === meta.totalPages} onClick={() => dispatch(fetchLessons({ page: meta.currentPage + 1, limit: 5 }))}>Next</button>
      </div>
    </div>
  );
}