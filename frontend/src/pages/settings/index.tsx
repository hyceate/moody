import { useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import {
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import { Field, Form, Formik } from 'formik';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../../actions/auth';
// Settings page start
export default function Settings() {
  const { isAuthenticated, user } = useAuth();
  const username = user?.username;

  useEffect(() => {
    document.title = 'User Settings';
  }, []);
  if (!isAuthenticated) return <Navigate to="/" replace></Navigate>;
  return (
    <>
      <section className="flex flex-col justify-center items-center gap-4">
        <h1 className="text-2xl font-bold">edit profile</h1>
        <Avatar name={`${username}`} boxSize="90px" />
        <Formik
          initialValues={{ username: `${username}` }}
          onSubmit={(values, actions) => {
            console.log(values);
            actions.setSubmitting(false);
          }}
        >
          {(props) => (
            <Form className="flex flex-col justify-center items-center gap-4">
              <Field name="username" validate={validateName}>
                {({ field, form }) => (
                  <FormControl>
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <Input {...field} placeholder={`${username}`} size="lg" />
                  </FormControl>
                )}
              </Field>
              <Field name="email">
                {({ field, form }) => (
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} size="lg" />
                  </FormControl>
                )}
              </Field>
              <Field name="oldPassword">
                {({ field }) => (
                  <FormControl>
                    <FormLabel>Old Password</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Old Password"
                    />
                  </FormControl>
                )}
              </Field>
              <Field name="newPassword">
                {({ field }) => (
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="New Password"
                    />
                  </FormControl>
                )}
              </Field>
              <Field name="confirmPassword">
                {({ field }) => (
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm New Password"
                    />
                  </FormControl>
                )}
              </Field>
              <Button isLoading={props.isSubmitting} type="submit" width="100%">
                Save
              </Button>
            </Form>
          )}
        </Formik>
      </section>
    </>
  );
}
