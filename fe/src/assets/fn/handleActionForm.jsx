const handleActionForm = ({ menuRef, profileActionRef }) => {
  const menuToggle = () => menuRef.current.classList.toggle("active_menu");

  const toggleProfileAction = () =>
    profileActionRef.current.classList.toggle("show_profile_action");
  return { menuToggle, toggleProfileAction };
};

export default handleActionForm;
