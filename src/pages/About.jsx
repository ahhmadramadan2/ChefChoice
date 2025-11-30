
import heroBg from "../assets/about.jpg";

function About() {
  return (
    <section className="page about-section" style={{ "--bg-img": `url(${heroBg})` }}>
      <div className="container">
        <h1>About ChefChoice</h1>
        <p className="section-subtitle">
          A warm, cozy restaurant inspired by authentic flavors and modern cuisine.
        </p>

        <p>
          ChefChoice brings together fresh ingredients, rich flavors, and a welcoming atmosphere 
          designed for families, friends, and food lovers. Our goal is simple — to serve food that 
          feels comforting, familiar, and full of heart.
        </p>

        <p>
          Every dish on our menu is crafted by our chefs using high-quality produce and traditional 
          recipes, blended with a modern twist. Whether you're joining us for a quick bite or a relaxed 
          dinner, ChefChoice promises an experience that is both elegant and homey.
        </p>

        <h2>Our Philosophy</h2>
        <ul>
          <li>Fresh, locally sourced ingredients.</li>
          <li>Authentic flavors prepared with care.</li>
          <li>A cozy ambiance where everyone feels at home.</li>
          <li>Quality first in every meal we serve.</li>
        </ul>

        <h2>Our Vision</h2>
        <ul>
          <li>To be a place where people gather and create lasting memories.</li>
          <li>To deliver consistent, high-quality dishes every day.</li>
          <li>To offer hospitality that makes every guest feel special.</li>
        </ul>

        <h2>Future Plans</h2>
        <ul>
          <li>Seasonal menu expansions.</li>
          <li>Catering and private event services.</li>
          <li>A loyalty program for our regular guests.</li>
          <li>Chef-led workshops and special dining experiences.</li>
        </ul>
      </div>
    </section>
  );
}

export default About;











// import heroBg from "../assets/about.jpg";

// function About() {
//   return (
//     <section className="page about-section" style={{ "--bg-img": `url(${heroBg})` }}>
//       <div className="container">
//         <h1>About ChefChoice</h1>
//         <p className="section-subtitle">
//           A simple restaurant web app designed to make online ordering easier and smarter.
//         </p>

//         <p>
//           ChefChoice is a demo restaurant ordering website created as a university project.
//           The main idea is to show how a modern frontend can help users browse a menu,
//           filter dishes, build a custom meal, and manage their cart in a smooth way.
//         </p>

//         <p>
//           The website is built using <strong>ReactJS</strong> with a focus on clean layout,
//           reusable components, and responsive design. It is also deployed on GitHub Pages
//           to show basic skills in version control and deployment.
//         </p>

//         <h2>Design Goals</h2>
//         <ul>
//           <li>Simple and clear user interface.</li>
//           <li>Fast navigation between pages without full page reloads.</li>
//           <li>Mobile-friendly layout that works on phones and laptops.</li>
//           <li>Easy to extend later with a real backend and database.</li>
//         </ul>

//         <h2>Future Improvements</h2>
//         <ul>
//           <li>Add real user accounts and login.</li>
//           <li>Connect to a backend API for real orders.</li>
//           <li>Save favourite dishes per user.</li>
//           <li>Live order tracking with real data instead of simulation.</li>
//         </ul>
//       </div>
//     </section>
//   );
// }

// export default About;
