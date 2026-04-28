import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessons } from '../store/lessonSlice';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';

export default function ChildDashboard() {
  const dispatch = useDispatch();
  const { lessons } = useSelector((state) => state.lesson);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchLessons());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-800">Привет, {user?.name}!</h1>
          <p className="text-gray-600">Твои уроки и достижения</p>
        </div>
        <button onClick={() => dispatch(logout())} className="bg-red-500 text-white px-4 py-2 rounded-lg">Выйти</button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Link key={lesson.id} to={`/child/lesson/${lesson.id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 block">
            <h2 className="text-xl font-bold text-purple-700">{lesson.title}</h2>
            <p className="text-gray-600 mt-1">{lesson.description}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">🎁 {lesson.xp_reward} XP</span>
              <span className="text-blue-500">Подробнее →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}