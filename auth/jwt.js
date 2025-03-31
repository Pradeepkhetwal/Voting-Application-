import jwt from 'jsonwebtoken';

export const jwtAuthMiddleware = (req, res, next) => {
  
  //first check request header has authorization or not.
  const authorization = req.headers.authorization
  if (!authorization) {
    return res.status(401).json({ error: "Token Not Found" });
  }
  //at first extract the jwt token from the user request.
 
  const token = req.headers.authorization.split(' ')[1];

  // token is stored in the Authorization header of the HTTP request
  // req.headers.authorization:his accesses the Authorization header of the incoming HTTP request
  // The Authorization header typically contains credentials for HTTP authentication. In the case of a JWT, it usually looks like this: Authorization: Bearer <token>
  // Bearer" refers to the type of token being used.
  // The token is a bearer token, which means that whoever bears (or possesses) this token is granted access to the protected resource.
  // The word Bearer is the authentication scheme, and <token> is the actual JWT token

  // so in request authorizatin header is like Authorization: Bearer abc123xyz
  // after bearer we have the actual token so to get the token we need to split the above string using space and then [1] is the index 1 means second element which is returned in the array where elements are spllited by single space so here 2nd element of the array is the actual token.
  if (!token) {
    return res.status(401).json({error:"Unauthorized"})

  }

  try {
    //verify the token. Token is verified by jwt.verify method which takes 2 arguments one is the token sent by ther user to the server and other is the secret key which will be used to check whether the token is valid or not by the server.

    //if token is successfully verified it returns the payload it stores .This payload contains the user information like meta data ,settings,perferences.

    const payload = jwt.verify(token, process.env.JWT_SECRET);


    //now we will attach this payload(user information) to user's request.

    //Here i have given field name as  user_payload , you can give any.


    req.user_payload = payload;

    //all done simply call next.
    next();
  } catch (error) {
    console.error(error)
    res.status(401).json({ error: "Invalid token" });
  }
}


//function to generate the JWT TOKEN.
//this function will take userdata to generate jwt token.
//using sign function which is a inbuilt function that generates jwt token we generate the token, this function usually takes the userdata(payload) in the form of object and the secret key to generate the token.Also here we passed an additional parameter for token expiry which specifies ki token kitne seconds baad expire hoga.
//note -: secret key is required at both the times for token generation as well as token verification.
//here the token will automatically expired after 20000 sec.

export const generateToken = (userdata ) => {
  return jwt.sign({ userdata } , process.env.JWT_SECRET,{expiresIn:20000});
}


// So from here go to PersonRoutes as we want ki jaise hi signup ho to return mein token bhi mile user ko so we have to code there also.

//so to generate new token let's create a route in PersonRoutes where user can login and can generate new token . 