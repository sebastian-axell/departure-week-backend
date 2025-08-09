function generateProductEmailHTML(data) {
  const {
    src = [],
    heading = 'No Title',
    description = '',
    tags = [],
    sold = false,
    interestee = 'N/A'
  } = data;

  const status = sold ? 'Sold' : 'Available';
  const tagsList = tags.join(', ');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Interest Notification</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #333; color: #ffffff;">
        <h1 style="margin: 0;">New item interest alert</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <h2 style="color: #333;">${heading}</h2>
        <p style="color: #555;">${description}</p>
        <p><strong>Tags:</strong> ${tagsList}</p>
        <p><strong>Status:</strong> ${status}</p>
        <hr />
        <p><strong>Interested Party:</strong> ${interestee}</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = {
  generateProductEmailHTML
}