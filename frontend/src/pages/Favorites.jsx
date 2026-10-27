import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Heart, MapPin, Zap, Trash2, ArrowRight } from 'lucide-react';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/favorites');
      setFavorites(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (id) => {
    try {
      await api.delete(`/users/me/favorites/${id}`);
      setFavorites(favorites.filter((f) => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Charging Hubs</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Quickly monitor demand and predict queues for your bookmarked stations.
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={3} />
      ) : favorites.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Heart className="w-12 h-12 text-slate-200 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No saved stations yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any charging station card or details page to bookmark it for quick access.
          </p>
          <Link
            to="/stations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Explore Stations Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map((st) => (
            <div
              key={st.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {st.station_id}
                  </span>
                  <button
                    onClick={() => removeFavorite(st.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove favorite"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {st.name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{st.city || st.state}, {st.state}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Power</span>
                  <span className="font-semibold text-slate-700">{st.total_power_kw || 60} kW</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-semibold text-emerald-600">Operational</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <Link
                  to={`/stations/${st.id}`}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  to={`/predictions?station_id=${st.id}`}
                  className="py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" /> Predict
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
