'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { schoolAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

const schema = yup.object({
  name: yup.string().required('School name is required').min(2, 'Name must be at least 2 characters'),
  address: yup.string().required('Address is required').min(10, 'Address must be at least 10 characters'),
  city: yup.string().required('City is required').min(2, 'City must be at least 2 characters'),
  state: yup.string().required('State is required').min(2, 'State must be at least 2 characters'),
  contact: yup.string()
    .required('Contact number is required')
    .matches(/^[0-9]{10,15}$/, 'Contact must be 10-15 digits'),
  email_id: yup.string().required('Email is required').email('Invalid email format'),
  image: yup.mixed<FileList>().required('School image is required')
});

type FormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image: FileList;
};

export default function AddSchool() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('contact', data.contact);
      formData.append('email_id', data.email_id);

      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      }

      const response = await schoolAPI.create(formData);

      if (response.data.success) {
        setSubmitMessage({ type: 'success', message: 'School added successfully!' });
        reset();
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', message: 'Failed to add school. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-800 mb-2">Add New School</h1>
            <p className="text-amber-600">Fill in the details to register a new school</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <h2 className="text-2xl font-semibold text-white">School Information</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 text-black">
              {submitMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    submitMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {submitMessage.message}
                </div>
              )}

              {/* School Name */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">School Name *</label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter school name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Address *</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Enter complete address"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">City *</label>
                  <input
                    {...register('city')}
                    type="text"
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">State *</label>
                  <input
                    {...register('state')}
                    type="text"
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter state"
                  />
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                </div>
              </div>

              {/* Contact & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">Contact Number *</label>
                  <input
                    {...register('contact')}
                    type="tel"
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter contact number"
                  />
                  {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-2">Email Address *</label>
                  <input
                    {...register('email_id')}
                    type="email"
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter email address"
                  />
                  {errors.email_id && <p className="mt-1 text-sm text-red-600">{errors.email_id.message}</p>}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">School Image *</label>
                <input
                  {...register('image')}
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-amber-600 hover:to-orange-600 focus:ring-2 focus:ring-amber-500 disabled:opacity-50 shadow-lg"
              >
                {isSubmitting ? 'Adding...' : 'Add School'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
