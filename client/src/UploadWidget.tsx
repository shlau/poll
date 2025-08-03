import { useEffect, useRef } from "react";

const UploadWidget = () => {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  // var generateSignature = function (callback, params_to_sign) {
  //   $.ajax({
  //     url: "https://www.my-domain.com/my_generate_signature",
  //     type: "GET",
  //     dataType: "text",
  //     data: { data: params_to_sign },
  //     complete: function () {
  //       console.log("complete");
  //     },
  //     success: function (signature, textStatus, xhr) {
  //       callback(signature);
  //     },
  //     error: function (xhr, status, error) {
  //       console.log(xhr, status, error);
  //     },
  //   });
  // };
  const generateSignature = async (cb: Function, paramsToSign: any) => {
    try {
      const queryParams = Object.keys(paramsToSign)
        .map((key) => `${key}=${encodeURIComponent(paramsToSign[key])}`)
        .join("&");
      const url = `/api/signature?${queryParams}`;
      const response = await fetch(url, { method: "GET" });
      const signature = await response.json();
      cb(signature);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // @ts-ignore
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_IMAGE_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_IMAGE_UPLOAD_PRESET,
        api_key: import.meta.env.VITE_API_KEY,
        uploadSignature: generateSignature,
      },
      function (error: any, result: any) {
        console.log(result);
        // Handle the result or error here
      }
    );
  }, []);

  return (
    <div>
      <button onClick={() => widgetRef.current.open()}>Upload</button>
    </div>
  );
};

export default UploadWidget;
