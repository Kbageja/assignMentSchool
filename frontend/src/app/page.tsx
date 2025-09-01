'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { schoolAPI } from '@/lib/api';
import { School } from '@/types';


export default function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.getAll();
      if (response.data.success) {
        setSchools(response.data.data || []);
      } else {
        setError('Failed to fetch schools');
      }
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.response?.data?.error || 'Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolClick = (schoolId: number) => {
    // You can add individual school page navigation here
    console.log('School clicked:', schoolId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700 font-medium">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-700 font-medium mb-4">{error}</p>
            <button
              onClick={fetchSchools}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Our Schools</h1>
          <p className="text-amber-600 mb-6">Discover quality education institutions</p>
          
          <button
            onClick={() => router.push('/add-school')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
          >
            + Add New School
          </button>
        </div>

        {/* Schools Count */}
        <div className="text-center mb-8">
          <p className="text-amber-700 font-medium">
            {schools.length} {schools.length === 1 ? 'School' : 'Schools'} Found
          </p>
        </div>

        {/* Schools Grid */}
        {schools.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 max-w-md mx-auto">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-amber-800 mb-2">No Schools Found</h3>
              <p className="text-amber-600 mb-4">Get started by adding your first school</p>
              <button
                onClick={() => router.push('/add-school')}
                className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200"
              >
                Add School
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {schools.map((school) => (
              <div
                key={school.id}
                onClick={() => handleSchoolClick(school.id)}
                className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                {/* School Image */}
                <div className="relative h-48 bg-amber-100 overflow-hidden school-image">
                  {school.imageUrl ? (
                    <div className="w-full h-full">
                      <img
                        src={school.imageUrl}
                        alt={school.name}
                        className="  group-hover:scale-110 transition-transform duration-300"
                        crossOrigin="anonymous"
                       
                        onError={(e) => {
                          console.log('Image failed to load:', school.imageUrl);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-amber-100">
                                <div class="text-center">
                                  <svg class="w-16 h-16 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <p class="text-amber-500 text-sm">Image not found</p>
                                </div>
                              </div>
                            `;
                          }
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully:', school.imageUrl);
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '1';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-amber-500 text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                  
                  
                </div>

                {/* School Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-amber-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
                    {school.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="line-clamp-2">{school.address}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="font-medium text-amber-700">{school.city}, {school.state}</p>
                    </div>
                  </div>

                  {/* Contact Badge */}
                  <div className="mt-4 pt-4 border-t border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-amber-600">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {school.contact}
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}