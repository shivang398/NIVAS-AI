
export const success = (res, data = {}, message = "Success", code = 200) => {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
};


export const error = (res, message = "Something went wrong", code = 500, errors = null) => {
  return res.status(code).json({
    success: false,
    message,
    errors,
  });
};


export const created = (res, data = {}, message = "Resource created successfully") => {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
};


export const noContent = (res) => {
  return res.status(204).send();
};


export const paginated = (
  res,
  data = [],
  page = 1,
  limit = 10,
  total = 0,
  message = "Data fetched successfully"
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};