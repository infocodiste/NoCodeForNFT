/***
 *
 * Login.js
 * Created By : Nishant
 *
 ***/

// Import required Modules
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { AxiosInstance } from "../../AxiosRequest";
import { useEffect } from "react";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const history = useHistory();
  useEffect(() => {
    if (localStorage.getItem("token")) history.push("/admin/dashboard");
  }, []);
  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center mt-5 pt-5">
        <div className="col-md-6">
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            enableReinitialize={true}
            validationSchema={LoginSchema}
            onSubmit={async (values, { setErrors, setSubmitting }) => {
              try {
                const data = await AxiosInstance.postPostRequest(
                  "/user/login",
                  values,
                  "post"
                );
                localStorage.setItem("token", data.token);
                history.push("/admin/dashboard");
              } catch (error) {
                setErrors({
                  email: "Please enter valid email and password.",
                });
                setSubmitting(false);
              }
            }}
          >
            {({ values, errors, touched, handleChange, isSubmitting }) => (
              <Form className="pt-3">
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-group">
                    <input
                      type="email"
                      className="form-control form-control-lg border-left-0"
                      placeholder="Email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                    />
                    {errors.email && touched.email ? (
                      <div className="invalid-feedback d-block">
                        {errors.email}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label>Password</label>
                  <div className="input-group">
                    <input
                      type="password"
                      className="form-control form-control-lg border-left-0"
                      placeholder="Password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                    />
                    {errors.password && touched.password ? (
                      <div className="invalid-feedback d-block">
                        {errors.password}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="my-3">
                  <button
                    disabled={isSubmitting}
                    className="btn btn-block btn-primary btn-lg font-weight-medium"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
export default Login;
