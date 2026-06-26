'use client';

import { IUser } from '@/lib/interface/IUser.interface';
import { UserService } from '@/lib/service';
import { Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/navigation';
import { Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { MdLockOutline, MdOutlineEdit } from 'react-icons/md';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { object, string } from 'yup';
import { Button } from '../Button/Button';
import { FormikField } from '../FormikField/FormikField';
import { FormikPhoneNumber } from '../FormikPhoneNumber/FormikPhoneNumber';

interface AddOrEditUserProps {
  apiKey: string;
  user?: IUser;
}

interface FormValues {
  name: string;
  phone_number: string;
  email: string;
}

const validationSchema = object({
  name: string()
    .matches(/^[a-zA-Z\s]*$/, 'Name must contain only letters and spaces')
    .min(3, 'Name must be between 3 and 40 characters')
    .max(40, 'Name must be between 3 and 40 characters')
    .required('Name is required'),
  email: string().email('Invalid email address'),
  phone_number: string().nullable().notRequired(),
});

export const handleUpdateProfile = async (
  values: FormValues,
  formikHelpers: FormikHelpers<FormValues>,
  router: ReturnType<typeof useRouter>,
  apiKey: string,
) => {
  const { setFieldError, setSubmitting } = formikHelpers;

  if (values.phone_number && !isValidPhoneNumber(values.phone_number)) {
    setFieldError('phone_number', 'Must be a valid phone number');
    setSubmitting(false);
    return;
  }

  try {
    // Note: email is intentionally not sent — own email can't be changed here.
    const res = await UserService.updateCurrentUser(
      {
        name: values.name,
        phone_number: values.phone_number || '',
      },
      apiKey,
    );

    const { success, error } = res?.data as { success: boolean; error: string[] };

    if (success) {
      toast.success('Profile updated');
      router.refresh();
    } else {
      toast.error(error?.[0] ?? 'Something went wrong');
    }
  } catch {
    toast.error('Something went wrong');
  } finally {
    setSubmitting(false);
  }
};

export default function AddorEditUser({
  user,
  apiKey,
}: Readonly<AddOrEditUserProps>) {
  const router = useRouter();

  const initialValues: FormValues = {
    name: user?.name ?? '',
    phone_number: user?.phone_number ?? '',
    email: user?.email ?? '',
  };

  const onSubmit = async (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>,
  ) => {
    await handleUpdateProfile(values, formikHelpers, router, apiKey);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
      validateOnChange={false}
    >
      {({
        errors, isSubmitting, handleSubmit, setFieldValue, values, resetForm, dirty,
      }) => (
        <Form onSubmit={handleSubmit} className="w-100">
          <FormikField
            name="name"
            errors={errors as Record<string, string>}
            validationSchema={validationSchema}
            label="Name"
            type="text"
            placeholder="Enter your name"
            isCustomRequired
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              setFieldValue('name', value);
            }}
            icon={<MdOutlineEdit />}
            rightIcon
          />

          <div className="mt-2">
            <FormikField
              name="email"
              errors={errors as Record<string, string>}
              validationSchema={validationSchema}
              label="Email"
              type="email"
              placeholder="Enter your email"
              disabled
              icon={<MdLockOutline />}
              rightIcon
            />
          </div>

          <div className="mt-2">
            <FormikPhoneNumber
              name="phone_number"
              label="Phone Number"
              onChange={(phoneNumber) => setFieldValue('phone_number', phoneNumber)}
              value={values.phone_number}
              errors={errors.phone_number}
              validationSchema={validationSchema}
              isCustomRequired={false}
            />
          </div>

          <div className="d-flex justify-content-end mt-5 gap-3">
            <Button
              text="Cancel"
              onClick={() => resetForm()}
              className="w-100"
            />
            <Button
              text={isSubmitting ? 'Updating' : 'Update'}
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!dirty || isSubmitting}
              isSolid
              className="w-100"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}