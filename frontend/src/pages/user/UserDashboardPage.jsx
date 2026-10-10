import React, { useState, useEffect, useCallback } from 'react';
import { storeService } from '../../services/store.service';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import SearchBar from '../../components/common/SearchBar';
import RatingStars from '../../components/common/RatingStars';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { Store, MapPin, Star, Edit3, PlusCircle, CheckCircle2 } from 'lucide-react';

const UserDashboardPage = () => {
  const { success, error: toastError } = useToast();
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Rating Modal state
  const [activeStore, setActiveStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeService.getStores({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        sortBy: 'name',
        sortOrder: 'ASC',
      });
      setStores(res.stores);
      setPagination(res.pagination);
    } catch (err) {
      toastError(err.message || 'Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, toastError]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenRating = (store) => {
    setActiveStore(store);
    setSelectedRating(store.user_rating || 5);
    setIsModalOpen(true);
  };

  const handleSubmitRating = async () => {
    if (!activeStore) return;
    setIsSubmittingRating(true);
    try {
      if (activeStore.user_rating) {
        await storeService.modifyRating(activeStore.id, selectedRating);
        success(`Your rating for "${activeStore.name}" was updated!`);
      } else {
        await storeService.submitRating(activeStore.id, selectedRating);
        success(`Your rating for "${activeStore.name}" was submitted!`);
      }
      setIsModalOpen(false);
      fetchStores();
    } catch (err) {
      toastError(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore Stores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse registered stores in your area, view community ratings, and share your feedback.
          </p>
        </div>

        {/* Debounced Search Input */}
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          placeholder="Search by store name or address..."
          className="w-full md:w-80"
        />
      </div>

      {/* Stores Grid */}
      {isLoading ? (
        <LoadingSkeleton type="cards" rows={6} />
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <EmptyState
            title="No stores found"
            description="We couldn't find any stores matching your search query. Try typing another store name or locality."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const hasUserRated = store.user_rating !== null && store.user_rating !== undefined;

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {store.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{store.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-slate-500 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{store.address}</span>
                  </div>

                  {/* Ratings Section */}
                  <div className="mt-5 space-y-3 pt-4 border-t border-slate-100">
                    {/* Overall Rating */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Overall Rating
                      </span>
                      <div className="flex items-center gap-1.5">
                        <RatingStars value={store.average_rating || 0} size="sm" showNumber />
                        <span className="text-[11px] text-slate-400">
                          ({store.total_ratings || 0})
                        </span>
                      </div>
                    </div>

                    {/* User's Rating */}
                    <div className="flex items-center justify-between bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/60">
                      <span className="text-xs font-semibold text-indigo-950">
                        Your Rating
                      </span>
                      {hasUserRated ? (
                        <div className="flex items-center gap-1">
                          <RatingStars value={store.user_rating} size="sm" />
                          <span className="text-xs font-bold text-indigo-700 ml-1">
                            {store.user_rating}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">
                          Not rated yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Action Button */}
                <div className="mt-6 pt-2">
                  {hasUserRated ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      icon={Edit3}
                      onClick={() => handleOpenRating(store)}
                    >
                      Modify Rating
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={PlusCircle}
                      onClick={() => handleOpenRating(store)}
                    >
                      Submit Rating
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* Interactive Rating Modal (Section 12) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeStore?.user_rating ? 'Modify Store Rating' : 'Submit Store Rating'}
        size="sm"
      >
        <div className="text-center space-y-5 py-2">
          <div>
            <h4 className="text-base font-bold text-slate-900">{activeStore?.name}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{activeStore?.address}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block">
            <RatingStars
              value={selectedRating}
              onChange={(newRating) => setSelectedRating(newRating)}
              interactive={true}
              size="lg"
            />
            <p className="text-xs font-semibold text-slate-600 mt-2">
              Selected: <span className="text-indigo-600 font-bold">{selectedRating}</span> out of 5 stars
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmittingRating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              isLoading={isSubmittingRating}
              onClick={handleSubmitRating}
            >
              {activeStore?.user_rating ? 'Save Changes' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDashboardPage;
